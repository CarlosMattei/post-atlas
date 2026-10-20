import type {
  LogResult,
  Post,
  PostImage,
  PublishLog,
  ScheduleConfig,
  TrendItem,
  TrendItemDetails,
  Workflow,
} from "./types";
import { query } from "./db";
import type { QueryResultRow } from "pg";

interface PostRow extends QueryResultRow {
  id: string;
  title: string;
  body: string;
  tags: string[] | null;
  image_path: string | null;
  status: Post["status"];
  ai_score: number | null;
  score_override: number | null;
  manual_order: number | null;
  scheduled_at: Date | null;
  published_at: Date | null;
  linkedin_post_id: string | null;
  attempts: number | null;
  last_error: string | null;
  created_at: Date;
  updated_at: Date;
}

interface PublishLogRow extends QueryResultRow {
  id: string;
  post_id: string | null;
  workflow: string;
  result: string;
  message: string | null;
  executed_at: Date;
}

interface ScheduleConfigRow extends QueryResultRow {
  publish_time: string;
  publish_weekdays: number[];
  timezone: string;
  paused: boolean;
  min_queue_alert: number;
}

interface TrendItemRow extends QueryResultRow {
  id: string;
  source: string;
  sources: string | null;
  title: string;
  score: number;
  status: TrendItem["status"];
  collected_on: Date | string;
}

interface TrendItemDetailsRow extends TrendItemRow {
  url: string | null;
  raw_metric: number;
  dedupe_key: string;
  collected_at: Date;
}

const trendStatuses = new Set<TrendItem["status"]>([
  "novo",
  "usado",
  "descartado",
]);

const workflows = new Set<Workflow>([
  "fila",
  "horario-fixo",
  "busca",
  "alerta",
  "score",
]);
const logResults = new Set<LogResult>(["sucesso", "erro", "ignorado"]);

function mapTrendRow(row: TrendItemRow): TrendItem {
  if (!trendStatuses.has(row.status)) {
    throw new Error(`Status inválido no item de tendência ${row.id}.`);
  }
  return {
    id: row.id,
    title: row.title,
    source: row.source,
    sources: (row.sources ?? row.source)
      .split(/\s*[,;]\s*/)
      .filter(Boolean),
    score: row.score,
    status: row.status,
    collectedOn:
      row.collected_on instanceof Date
        ? row.collected_on.toISOString().slice(0, 10)
        : row.collected_on,
  };
}

function mapRow(row: PostRow): Post {
  const images: PostImage[] = row.image_path
    ? [{ id: row.id + "-img", url: row.image_path, alt: "" }]
    : [];
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tags: row.tags ?? [],
    images,
    status: row.status,
    aiScore: row.ai_score ?? null,
    scoreOverride: row.score_override ?? null,
    manualOrder: row.manual_order ?? null,
    scheduledAt: row.scheduled_at ? row.scheduled_at.toISOString() : null,
    publishedAt: row.published_at ? row.published_at.toISOString() : null,
    linkedinPostId: row.linkedin_post_id ?? null,
    attempts: row.attempts ?? 0,
    lastError: row.last_error ?? null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getPosts(): Promise<Post[]> {
  const rows = await query<PostRow>(`SELECT * FROM posts ORDER BY updated_at DESC`);
  return rows.map(mapRow);
}

export async function getPostById(id: string): Promise<Post | undefined> {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return undefined;
  }

  const [row] = await query<PostRow>(`SELECT * FROM posts WHERE id = $1`, [id]);
  return row ? mapRow(row) : undefined;
}

export async function getHomeDashboardData() {
  const [posts, logRows, scheduleRows, trendRows, countRows] =
    await Promise.all([
      getPosts(),
      query<PublishLogRow>(
        `SELECT id, post_id, workflow, result, message, executed_at
         FROM publish_logs
         ORDER BY executed_at DESC
         LIMIT 5`,
      ),
      query<ScheduleConfigRow>(
        `SELECT publish_time, publish_weekdays, timezone, paused, min_queue_alert
         FROM schedule_config
         WHERE id = 1`,
      ),
      query<TrendItemRow>(
        `SELECT id, source, sources, title, score, status, collected_on
         FROM trend_items
         WHERE collected_on = CURRENT_DATE
         ORDER BY collected_on DESC, score DESC
         LIMIT 4`,
      ),
      query<{ count: string } & QueryResultRow>(
        `SELECT count(*)::text AS count
         FROM trend_items
         WHERE status = 'novo' AND collected_on = CURRENT_DATE`,
      ),
    ]);

  const schedule = scheduleRows[0];
  if (!schedule) throw new Error("Configuração de agenda não encontrada no Neon.");

  const publishLogs: PublishLog[] = logRows.map((row) => {
    if (
      !workflows.has(row.workflow as Workflow) ||
      !logResults.has(row.result as LogResult)
    ) {
      throw new Error(`Registro de execução inválido no Neon (ID ${row.id}).`);
    }
    return {
      id: row.id,
      postId: row.post_id,
      workflow: row.workflow as Workflow,
      result: row.result as LogResult,
      message: row.message ?? "",
      executedAt: row.executed_at.toISOString(),
    };
  });
  const trendItems = trendRows.map(mapTrendRow);
  const scheduleConfig: ScheduleConfig = {
    publishTime: schedule.publish_time.slice(0, 5),
    publishWeekdays: schedule.publish_weekdays,
    timezone: schedule.timezone,
    paused: schedule.paused,
    minQueueAlert: schedule.min_queue_alert,
  };

  return {
    posts,
    publishLogs,
    scheduleConfig,
    trendItems,
    newTrendCount: Number(countRows[0].count),
  };
}

export async function getTrendItems(): Promise<TrendItem[]> {
  const rows = await query<TrendItemRow>(
    `SELECT id, source, sources, title, score, status, collected_on
     FROM trend_items
     ORDER BY collected_on DESC, score DESC`,
  );
  return rows.map(mapTrendRow);
}

export async function getTrendItemById(
  id: string,
): Promise<TrendItemDetails | undefined> {
  if (!/^\d+$/.test(id)) return undefined;
  const [row] = await query<TrendItemDetailsRow>(
    `SELECT id, source, sources, title, url, raw_metric, score, dedupe_key,
            collected_on, collected_at, status
     FROM trend_items
     WHERE id = $1`,
    [id],
  );
  if (!row) return undefined;
  return {
    ...mapTrendRow(row),
    url: row.url,
    rawMetric: row.raw_metric,
    dedupeKey: row.dedupe_key,
    collectedAt: row.collected_at.toISOString(),
  };
}

export async function getCalendarData() {
  const [posts, scheduleRows] = await Promise.all([
    getPosts(),
    query<ScheduleConfigRow>(
      `SELECT publish_time, publish_weekdays, timezone, paused, min_queue_alert
       FROM schedule_config
       WHERE id = 1`,
    ),
  ]);
  const schedule = scheduleRows[0];
  if (!schedule) throw new Error("Configuração de agenda não encontrada no Neon.");

  const scheduleConfig: ScheduleConfig = {
    publishTime: schedule.publish_time.slice(0, 5),
    publishWeekdays: schedule.publish_weekdays,
    timezone: schedule.timezone,
    paused: schedule.paused,
    minQueueAlert: schedule.min_queue_alert,
  };

  return { posts, scheduleConfig };
}
