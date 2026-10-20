import type { LogResult, Post, PostStatus, Workflow } from "./types";

const timezone = "America/Sao_Paulo";

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: timezone,
  })
    .format(new Date(iso))
    .replace(".", "")
    .replace(" de ", " ");
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatMonthShort(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    timeZone: timezone,
  })
    .format(new Date(iso))
    .replace(".", "");
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${formatShortDate(iso)} · ${formatTime(iso)}`;
}

export function formatWeekdayDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: timezone,
  })
    .format(new Date(iso))
    .replaceAll(".", "")
    .replace(" de ", " ");
}

export function formatWeekday(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function effectiveScore(post: Post): number {
  return post.scoreOverride ?? post.aiScore ?? 0;
}

export const statusLabels: Record<PostStatus, string> = {
  rascunho: "Rascunho",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  agendado: "Agendado",
  publicando: "Publicando",
  publicado: "Publicado",
  erro: "Erro",
  arquivado: "Arquivado",
};

export const logResultLabels: Record<LogResult, string> = {
  sucesso: "Sucesso",
  erro: "Erro",
  ignorado: "Ignorado",
};

export const workflowLabels: Record<Workflow, string> = {
  fila: "Publicação na fila",
  "horario-fixo": "Horário fixo",
  busca: "Busca de conteúdo",
  alerta: "Alerta de fila",
  score: "Score por IA",
};

export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}
