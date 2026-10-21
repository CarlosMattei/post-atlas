import type { PostImage, PostStatus } from "./types";

export const TITLE_MAX = 200;
export const BODY_MAX = 3000;
export const MAX_IMAGES = 9;

export const TAG_SUGGESTIONS = [
  "produtividade",
  "obsidian",
  "n8n",
  "automação",
  "linkedin",
  "ia",
  "processos",
  "carreira",
];

export type PublishStrategy = "fila" | "fixo";

export type PostFormValues = {
  title: string;
  body: string;
  tags: string[];
  images: PostImage[];
  strategy: PublishStrategy;
  scheduledAtDraft: string;
};

export type PostReadiness = {
  title: boolean;
  body: boolean;
  tags: boolean;
  strategy: boolean;
  contentReady: boolean;
  allReady: boolean;
};

export type PrimaryActionKind =
  | "approve-queue"
  | "approve-schedule"
  | "queue"
  | "schedule"
  | "cancel-schedule"
  | "unavailable";

export type PrimaryAction = {
  kind: PrimaryActionKind;
  label: string;
  helper: string;
  disabled: boolean;
};

export function getReadiness(values: PostFormValues): PostReadiness {
  const title =
    values.title.trim().length > 0 && values.title.length <= TITLE_MAX;
  const body =
    values.body.trim().length > 0 && values.body.length <= BODY_MAX;
  const tags = values.tags.length > 0;
  const strategy =
    values.strategy === "fila" || values.scheduledAtDraft.length > 0;
  const contentReady = title && body;

  return {
    title,
    body,
    tags,
    strategy,
    contentReady,
    allReady: contentReady && tags && strategy,
  };
}

function sameTags(current: string[], saved: string[]): boolean {
  return (
    current.length === saved.length &&
    current.every((tag, index) => tag === saved[index])
  );
}

function sameImages(current: PostImage[], saved: PostImage[]): boolean {
  return (
    current.length === saved.length &&
    current.every(
      (image, index) =>
        image.id === saved[index].id &&
        image.key === saved[index].key &&
        image.url === saved[index].url &&
        image.alt === saved[index].alt,
    )
  );
}

export function isDirty(
  current: PostFormValues,
  saved: PostFormValues,
): boolean {
  return (
    current.title !== saved.title ||
    current.body !== saved.body ||
    current.strategy !== saved.strategy ||
    current.scheduledAtDraft !== saved.scheduledAtDraft ||
    !sameTags(current.tags, saved.tags) ||
    !sameImages(current.images, saved.images)
  );
}

export function canReject(status: PostStatus): boolean {
  return (
    status === "rascunho" ||
    status === "aprovado" ||
    status === "agendado" ||
    status === "erro"
  );
}

export function getPrimaryAction(
  status: PostStatus,
  strategy: PublishStrategy,
  readiness: PostReadiness,
): PrimaryAction {
  switch (status) {
    case "arquivado":
      return {
        kind: "unavailable",
        label: "Restaure o post para continuar",
        helper: "Use o menu ⋯ para restaurar este post.",
        disabled: true,
      };
    case "publicando":
      return {
        kind: "unavailable",
        label: "Publicando…",
        helper: "Aguarde a confirmação do workflow.",
        disabled: true,
      };
    case "publicado":
      return {
        kind: "unavailable",
        label: "Post publicado",
        helper: "Posts publicados não podem ser reagendados.",
        disabled: true,
      };
    case "agendado":
      return {
        kind: "cancel-schedule",
        label: "Cancelar agendamento",
        helper: "O post volta para a fila e continua aprovado.",
        disabled: false,
      };
    case "aprovado":
      if (strategy === "fixo") {
        return {
          kind: "schedule",
          label: "Agendar",
          helper: readiness.strategy
            ? "Publica na data definida, ignorando a fila."
            : "Defina data e hora para agendar.",
          disabled: !readiness.contentReady || !readiness.strategy,
        };
      }

      return {
        kind: "queue",
        label: "Enviar para a fila",
        helper:
          "Publica no próximo dia útil às 09:00, conforme a ordem manual e o score.",
        disabled: !readiness.contentReady,
      };
    case "rascunho":
    case "reprovado":
    case "erro":
      if (strategy === "fixo") {
        return {
          kind: "approve-schedule",
          label: "Aprovar e agendar",
          helper: readiness.strategy
            ? "Aprova o post e publica na data definida."
            : "Defina data e hora para agendar.",
          disabled: !readiness.contentReady || !readiness.strategy,
        };
      }

      return {
        kind: "approve-queue",
        label: "Aprovar e enfileirar",
        helper:
          "Aprova o post e o coloca na fila do próximo dia útil às 09:00.",
        disabled: !readiness.contentReady,
      };
  }
}
