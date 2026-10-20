"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { QueryResultRow } from "pg";
import type { PostStatus } from "./types";
import { query } from "./db";

interface IdRow extends QueryResultRow {
  id: string;
}

const postStatuses = new Set<PostStatus>([
  "rascunho",
  "aprovado",
  "reprovado",
  "agendado",
  "publicando",
  "publicado",
  "erro",
  "arquivado",
]);

function validateId(id: string): void {
  if (
    typeof id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    throw new Error("ID de post inválido.");
  }
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 20) {
    throw new Error("Informe até 20 tags.");
  }

  const tags = value.map((tag) => {
    if (typeof tag !== "string") throw new Error("Tag inválida.");
    const normalized = tag.trim().replace(/^#/, "").toLowerCase();
    if (normalized.length > 50) {
      throw new Error("Cada tag pode ter até 50 caracteres.");
    }
    return normalized;
  });

  return [...new Set(tags.filter(Boolean))];
}

function validateContent(title: unknown, body: unknown) {
  if (
    typeof title !== "string" ||
    title.trim().length < 1 ||
    title.trim().length > 200
  ) {
    throw new Error("O título deve ter entre 1 e 200 caracteres.");
  }
  if (
    typeof body !== "string" ||
    body.trim().length < 1 ||
    body.trim().length > 3000
  ) {
    throw new Error("O texto deve ter entre 1 e 3000 caracteres.");
  }
  return { title: title.trim(), body: body.trim() };
}

function revalidatePosts(id?: string): void {
  revalidatePath("/posts");
  revalidatePath("/arquivados");
  revalidatePath("/calendario");
  if (id) revalidatePath(`/posts/${id}`);
}

export async function movePostInCalendar(
  id: string,
  date: string | null,
  time: string,
  timezone: string,
): Promise<void> {
  validateId(id);
  if (date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Data inválida.");
  }
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error("Horário inválido.");
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    throw new Error("Fuso horário inválido.");
  }

  const updated = await query<IdRow>(
    `UPDATE posts
     SET status = CASE WHEN $2::date IS NULL THEN 'aprovado'::post_status
                       ELSE 'agendado'::post_status END,
         scheduled_at = CASE
           WHEN $2::date IS NULL THEN NULL
           ELSE ($2::date + $3::time) AT TIME ZONE $4
         END,
         updated_at = now()
     WHERE id = $1 AND status NOT IN ('publicado', 'publicando', 'arquivado')
     RETURNING id`,
    [id, date, time, timezone],
  );
  if (updated.length === 0) {
    throw new Error("Post não encontrado ou não pode ser reagendado.");
  }
  revalidatePosts(id);
}

export async function createPost(formData: FormData): Promise<void> {
  const { title, body } = validateContent(
    formData.get("title"),
    formData.get("body"),
  );
  const tags = parseTags(String(formData.get("tags") ?? "").split(","));
  const strategy = formData.get("strategy") === "fixo" ? "fixo" : "fila";
  const requestedStatus =
    formData.get("status") === "aprovado" ? "aprovado" : "rascunho";
  const rawScheduledAt = String(formData.get("scheduledAt") ?? "");
  const scheduledAt =
    requestedStatus === "aprovado" && strategy === "fixo"
      ? new Date(`${rawScheduledAt}:00-03:00`)
      : null;

  if (requestedStatus === "aprovado" && tags.length === 0) {
    throw new Error("Adicione pelo menos uma tag antes de aprovar.");
  }
  if (
    requestedStatus === "aprovado" &&
    strategy === "fixo" &&
    (!rawScheduledAt || !scheduledAt || Number.isNaN(scheduledAt.getTime()))
  ) {
    throw new Error("Informe uma data e hora válidas para agendar.");
  }

  const status: PostStatus =
    requestedStatus === "aprovado" && strategy === "fixo"
      ? "agendado"
      : requestedStatus;
  const [created] = await query<IdRow>(
    `INSERT INTO posts (title, body, tags, status, scheduled_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [title, body, tags, status, scheduledAt],
  );

  if (!created) throw new Error("Não foi possível criar o post no Neon.");
  revalidatePosts(created.id);
  redirect(`/posts/${created.id}`);
}

export async function updatePost(
  id: string,
  input: {
    title: string;
    body: string;
    tags: string[];
    imageUrl: string | null;
    scheduledAt: string | null;
  },
): Promise<void> {
  validateId(id);
  if (!input || typeof input !== "object") {
    throw new Error("Dados do post inválidos.");
  }
  const { title, body } = validateContent(input.title, input.body);
  const tags = parseTags(input.tags);
  if (
    input.imageUrl !== null &&
    (typeof input.imageUrl !== "string" ||
      !/^https?:\/\//i.test(input.imageUrl))
  ) {
    throw new Error("A imagem precisa ter uma URL HTTP ou HTTPS.");
  }
  const imageUrl = input.imageUrl;
  const scheduledAt =
    input.scheduledAt === null
      ? null
      : typeof input.scheduledAt === "string"
        ? new Date(input.scheduledAt)
        : null;

  if (input.scheduledAt !== null && (!scheduledAt || Number.isNaN(scheduledAt.getTime()))) {
    throw new Error("Data e hora inválidas.");
  }

  const updated = await query<IdRow>(
    `UPDATE posts
     SET title = $2, body = $3, tags = $4, image_path = $5,
         scheduled_at = $6,
         status = CASE
           WHEN status = 'agendado' AND $6::timestamptz IS NULL
             THEN 'aprovado'::post_status
           ELSE status
         END,
         updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [id, title, body, tags, imageUrl, scheduledAt],
  );
  if (updated.length === 0) throw new Error("Post não encontrado.");
  revalidatePosts(id);
}

export async function updatePostStatus(
  id: string,
  status: PostStatus,
  scheduledAt: string | null = null,
): Promise<void> {
  validateId(id);
  if (!postStatuses.has(status)) throw new Error("Status de post inválido.");
  const scheduled =
    status === "agendado" && scheduledAt ? new Date(scheduledAt) : null;
  if (
    status === "agendado" &&
    (!scheduled || Number.isNaN(scheduled.getTime()))
  ) {
    throw new Error("Informe uma data e hora válidas para agendar.");
  }

  const updated = await query<IdRow>(
    `UPDATE posts
     SET status = $2, scheduled_at = $3, updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [id, status, scheduled],
  );
  if (updated.length === 0) throw new Error("Post não encontrado.");
  revalidatePosts(id);
}

export async function deletePost(id: string): Promise<void> {
  validateId(id);
  const deleted = await query<IdRow>(
    `DELETE FROM posts WHERE id = $1 RETURNING id`,
    [id],
  );
  if (deleted.length === 0) throw new Error("Post não encontrado.");
  revalidatePosts(id);
}
