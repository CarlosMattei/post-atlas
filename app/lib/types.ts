export type PostStatus =
  | "rascunho"
  | "aprovado"
  | "reprovado"
  | "agendado"
  | "publicando"
  | "publicado"
  | "erro"
  | "arquivado";

export type LogResult = "sucesso" | "erro" | "ignorado";

export type Workflow =
  | "fila"
  | "horario-fixo"
  | "busca"
  | "alerta"
  | "score";

export type PostImage = {
  id: string;
  url: string;
  alt: string;
};

export type Post = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  images?: PostImage[];
  status: PostStatus;
  aiScore: number | null;
  scoreOverride: number | null;
  manualOrder: number | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  linkedinPostId: string | null;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublishLog = {
  id: string;
  postId: string | null;
  workflow: Workflow;
  result: LogResult;
  message: string;
  executedAt: string;
};

export type TrendStatus = "novo" | "usado" | "descartado";

export type TrendItem = {
  id: string;
  title: string;
  source: string;
  sources: string[];
  score: number;
  status: TrendStatus;
  collectedOn: string;
};

export type TrendItemDetails = TrendItem & {
  url: string | null;
  rawMetric: number;
  dedupeKey: string;
  collectedAt: string;
};

export type IntegrationStatus = "conectado" | "atencao" | "desconectado";

export type Integration = {
  id: "linkedin" | "n8n" | "openrouter" | "telegram" | "postgres";
  name: string;
  description: string;
  status: IntegrationStatus;
  details: Array<{ label: string; value: string }>;
  lastCheckedAt: string;
  actionLabel: string;
};

export type ScheduleConfig = {
  publishTime: string;
  publishWeekdays: number[];
  timezone: string;
  paused: boolean;
  minQueueAlert: number;
};
