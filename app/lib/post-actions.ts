"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { QueryResultRow } from "pg";
import type { PostStatus } from "./types";
import { query } from "./db";
import { MAX_IMAGES } from "./post-form";
import { deletePostImageObjects, isPostImageKey } from "./s3";

interface IdRow extends QueryResultRow {
  id: string;
}

interface PostStatusRow extends QueryResultRow {
  status: PostStatus;
}

interface PostContentRow extends PostStatusRow {
  title: string;
  body: string;
  tags: string[];
}

interface PostImagePathsRow extends QueryResultRow {
  image_path: string | null;
  image_paths?: string[] | null;
}

interface PostImageInput {
  key: string;
  alt: string;
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

function parseImages(value: unknown): PostImageInput[] {
  if (value === null || value === undefined) return [];

  if (!Array.isArray(value) || value.length > MAX_IMAGES) {
    throw new Error(`Envie até ${MAX_IMAGES} imagens por post.`);
  }

  return value.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Imagem inválida.");
    }

    const { key, alt } = item as { key?: unknown; alt?: unknown };

    if (typeof key !== "string" || key.trim().length === 0) {
      throw new Error("A imagem não tem uma chave válida.");
    }

    const normalized = key.trim();

    if (!isPostImageKey(normalized) && !/^https?:\/\//i.test(normalized)) {
      throw new Error("A imagem precisa estar no bucket de uploads do post.");
    }

    if (alt !== undefined && typeof alt !== "string") {
      throw new Error("Texto alternativo inválido.");
    }

    return { key: normalized, alt: (alt ?? "").trim().slice(0, 300) };
  });
}

function parseImagesField(value: FormDataEntryValue | null): PostImageInput[] {
  if (typeof value !== "string" || value.trim().length === 0) return [];

  try {
    return parseImages(JSON.parse(value));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Lista de imagens inválida.");
    }
    throw error;
  }
}

function imagePathsFromRow(row: PostImagePathsRow): string[] {
  if (row.image_paths?.length) return row.image_paths;
  return row.image_path ? [row.image_path] : [];
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
  const images = parseImagesField(formData.get("images"));
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
    `INSERT INTO posts (title, body, tags, status, scheduled_at, image_path, image_paths, image_alts)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      title,
      body,
      tags,
      status,
      scheduledAt,
      images[0]?.key ?? null,
      images.map((image) => image.key),
      images.map((image) => image.alt),
    ],
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
    images: PostImageInput[];
    scheduledAt: string | null;
  },
): Promise<void> {
  validateId(id);
  if (!input || typeof input !== "object") {
    throw new Error("Dados do post inválidos.");
  }
  const { title, body } = validateContent(input.title, input.body);
  const tags = parseTags(input.tags);
  const images = parseImages(input.images);
  const scheduledAt =
    input.scheduledAt === null
      ? null
      : typeof input.scheduledAt === "string"
        ? new Date(input.scheduledAt)
        : null;

  if (input.scheduledAt !== null && (!scheduledAt || Number.isNaN(scheduledAt.getTime()))) {
    throw new Error("Data e hora inválidas.");
  }

  const [existing] = await query<PostImagePathsRow>(
    `SELECT image_path, image_paths FROM posts WHERE id = $1`,
    [id],
  );
  if (!existing) throw new Error("Post não encontrado.");

  const updated = await query<IdRow>(
    `UPDATE posts
     SET title = $2, body = $3, tags = $4,
         image_path = $5, image_paths = $6, image_alts = $7,
         scheduled_at = $8,
         status = CASE
           WHEN status = 'agendado' AND $8::timestamptz IS NULL
             THEN 'aprovado'::post_status
           ELSE status
         END,
         updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [
      id,
      title,
      body,
      tags,
      images[0]?.key ?? null,
      images.map((image) => image.key),
      images.map((image) => image.alt),
      scheduledAt,
    ],
  );
  if (updated.length === 0) throw new Error("Post não encontrado.");

  const kept = new Set(images.map((image) => image.key));
  const removed = imagePathsFromRow(existing).filter((path) => !kept.has(path));
  await deletePostImageObjects(removed);
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

export async function approvePost(id: string): Promise<void> {
  validateId(id);
  const [post] = await query<PostContentRow>(
    `SELECT status, title, body, tags FROM posts WHERE id = $1`,
    [id],
  );
  if (!post) throw new Error("Post não encontrado.");
  if (post.status === "arquivado") {
    throw new Error("Restaure o post antes de aprová-lo.");
  }
  if (post.status === "publicado" || post.status === "publicando") {
    throw new Error("Posts publicados ou em publicação não podem ser aprovados.");
  }
  if (!post.title.trim() || !post.body.trim()) {
    throw new Error("Preencha o título e o texto do post antes de aprovar.");
  }
  if (post.tags.length === 0) {
    throw new Error("Adicione pelo menos uma tag antes de aprovar.");
  }

  const updated = await query<IdRow>(
    `UPDATE posts
     SET status = 'aprovado', scheduled_at = NULL, updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [id],
  );
  if (updated.length === 0) throw new Error("Post não encontrado.");
  revalidatePosts(id);
}

export async function archivePost(id: string): Promise<void> {
  validateId(id);
  const [post] = await query<PostStatusRow>(
    `SELECT status FROM posts WHERE id = $1`,
    [id],
  );
  if (!post) throw new Error("Post não encontrado.");
  if (post.status === "publicado") {
    throw new Error("Posts publicados são imutáveis e não podem ser arquivados.");
  }
  if (post.status === "publicando") {
    throw new Error("Aguarde a conclusão da publicação antes de arquivar.");
  }

  const updated = await query<IdRow>(
    `UPDATE posts
     SET status = 'arquivado', scheduled_at = NULL, updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [id],
  );
  if (updated.length === 0) throw new Error("Post não encontrado.");
  revalidatePosts(id);
}

export async function restorePost(id: string): Promise<void> {
  validateId(id);
  const updated = await query<IdRow>(
    `UPDATE posts
     SET status = 'rascunho', scheduled_at = NULL, updated_at = now()
     WHERE id = $1 AND status = 'arquivado'
     RETURNING id`,
    [id],
  );
  if (updated.length === 0) {
    throw new Error("Post não encontrado ou fora da lista de arquivados.");
  }
  revalidatePosts(id);
}

export async function deletePost(id: string): Promise<void> {
  validateId(id);
  const [existing] = await query<PostImagePathsRow>(
    `SELECT image_path, image_paths FROM posts WHERE id = $1`,
    [id],
  );
  const deleted = await query<IdRow>(
    `DELETE FROM posts WHERE id = $1 RETURNING id`,
    [id],
  );
  if (deleted.length === 0) throw new Error("Post não encontrado.");
  if (existing) await deletePostImageObjects(imagePathsFromRow(existing));
  revalidatePosts(id);
}
