"use server";

import { getTrendItemById } from "./queries";
import {
  describeWebhookFailure,
  postToN8n,
  readWebhookError,
  readWebhookMessage,
  webhookUrl,
} from "./n8n";

const DEFAULT_WEBHOOK_URL =
  "http://umbrel.local:5678/webhook/linkedin-trend-post";

const WEBHOOK_TIMEOUT_MS = 20_000;

function detailFrom(text: string): string | null {
  const mensagem = readWebhookMessage(text);

  if (mensagem) return mensagem;

  return /^[[{]/.test(text) ? null : text.slice(0, 200);
}

export async function triggerTrendToPost(
  id: string,
): Promise<{ detail: string | null }> {
  if (!/^\d+$/.test(id)) {
    throw new Error("Identificador de tendência inválido.");
  }

  const trend = await getTrendItemById(id);

  if (!trend) {
    throw new Error("Tendência não encontrada no banco.");
  }

  const payload = {
    trendId: trend.id,
    title: trend.title,
    source: trend.source,
    sources: trend.sources,
    score: trend.score,
    status: trend.status,
    collectedOn: trend.collectedOn,
    url: trend.url,
    rawMetric: trend.rawMetric,
    requestedAt: new Date().toISOString(),
  };

  const response = await postToN8n(
    webhookUrl("N8N_TREND_POST_WEBHOOK_URL", DEFAULT_WEBHOOK_URL),
    payload,
    WEBHOOK_TIMEOUT_MS,
  );

  if (!response.ok) {
    throw new Error(describeWebhookFailure(response));
  }

  const erro = readWebhookError(response.text);

  if (erro) throw new Error(erro);

  return { detail: detailFrom(response.text) };
}
