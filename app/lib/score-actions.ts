"use server";

import { revalidatePath } from "next/cache";
import type { QueryResultRow } from "pg";
import { query } from "./db";
import {
  describeWebhookFailure,
  postToN8n,
  readWebhookError,
  readWebhookScore,
  webhookUrl,
} from "./n8n";

const DEFAULT_SCORE_WEBHOOK_URL =
  "http://umbrel.local:5678/webhook/linkedin-score-post";

/**
 * Cada post gera uma chamada de IA (~15 s). O limite mantém a ação curta e o
 * restante aparece no toast para uma nova rodada.
 */
const MAX_POSTS_PER_RUN = 12;
const PARALLEL_CALLS = 3;
const CALL_TIMEOUT_MS = 45_000;

/** O workflow de score só avalia posts nesses status. */
const SCORABLE_STATUSES = ["rascunho", "aprovado"];

interface PendingPostRow extends QueryResultRow {
  id: string;
  title: string;
}

interface CountRow extends QueryResultRow {
  total: string;
}

export interface ScoreRunResult {
  /** Posts que receberam nota nesta rodada. */
  evaluated: number;
  /** Posts enviados que voltaram com erro. */
  failed: number;
  /** Posts elegíveis que ficaram na fila para a próxima rodada. */
  remaining: number;
  /** Até três mensagens de erro para exibir no toast. */
  errors: string[];
}

async function countPending(): Promise<number> {
  const [row] = await query<CountRow>(
    `SELECT count(*)::text AS total
       FROM posts
      WHERE ai_score IS NULL
        AND status = ANY($1::post_status[])`,
    [SCORABLE_STATUSES],
  );

  return Number(row?.total ?? 0);
}

async function scorePost(url: string, post: PendingPostRow): Promise<void> {
  const response = await postToN8n(url, { post_id: post.id }, CALL_TIMEOUT_MS);
  const erro = readWebhookError(response.text);

  if (!response.ok) {
    throw new Error(describeWebhookFailure(response));
  }

  if (erro) throw new Error(erro);

  if (readWebhookScore(response.text) === null) {
    throw new Error("O n8n respondeu sem o score do post.");
  }
}

/**
 * Envia para o n8n todos os posts elegíveis que ainda não têm `ai_score`.
 * O fluxo grava a nota direto no banco; a tela é revalidada no fim.
 */
export async function evaluatePostsWithoutScore(): Promise<ScoreRunResult> {
  const url = webhookUrl("N8N_SCORE_POST_WEBHOOK_URL", DEFAULT_SCORE_WEBHOOK_URL);

  const pending = await query<PendingPostRow>(
    `SELECT id, title
       FROM posts
      WHERE ai_score IS NULL
        AND status = ANY($1::post_status[])
      ORDER BY created_at ASC
      LIMIT $2`,
    [SCORABLE_STATUSES, MAX_POSTS_PER_RUN],
  );

  if (pending.length === 0) {
    return { evaluated: 0, failed: 0, remaining: 0, errors: [] };
  }

  let evaluated = 0;
  const errors: string[] = [];

  for (let start = 0; start < pending.length; start += PARALLEL_CALLS) {
    const batch = pending.slice(start, start + PARALLEL_CALLS);
    const results = await Promise.allSettled(
      batch.map((post) => scorePost(url, post)),
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        evaluated += 1;
        return;
      }

      if (errors.length < 3) {
        const reason =
          result.reason instanceof Error
            ? result.reason.message
            : "falha ao avaliar";

        errors.push(`“${batch[index].title}”: ${reason}`);
      }
    });
  }

  revalidatePath("/posts");
  revalidatePath("/calendario");
  revalidatePath("/");

  return {
    evaluated,
    failed: pending.length - evaluated,
    remaining: await countPending(),
    errors,
  };
}
