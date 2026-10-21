import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Armazenamento de imagens dos posts.
 *
 * Neon Object Storage é compatível com S3. As credenciais vivem apenas no
 * servidor (route handlers, server actions e queries) e nunca são enviadas ao
 * navegador. O navegador envia o arquivo para `/api/post-images`, que grava no
 * bucket e devolve a chave do objeto.
 */

const endpoint = process.env.AWS_ENDPOINT_URL_S3?.trim();
const region = process.env.AWS_REGION?.trim() || "us-east-1";
const bucket = process.env.S3_BUCKET?.trim() || "uploads";

/** Prefixo de todas as imagens de posts. Facilita limpeza e validação. */
export const POST_IMAGE_PREFIX = "posts";

/** Limite aceito pelo upload antes de gravar no bucket. */
export const MAX_POST_IMAGE_BYTES = 10 * 1024 * 1024;

/** Tipos aceitos e a extensão usada na chave do objeto. */
export const POST_IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export type PostImageContentType = keyof typeof POST_IMAGE_EXTENSIONS;

let client: S3Client | null = null;

function s3(): S3Client {
  if (!endpoint) {
    throw new Error(
      "AWS_ENDPOINT_URL_S3 não está definida. Configure o endpoint do Neon Object Storage.",
    );
  }

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error(
      "AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY são obrigatórias para o upload de imagens.",
    );
  }

  client ??= new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  return client;
}

export function isPostImageContentType(
  value: string,
): value is PostImageContentType {
  return value in POST_IMAGE_EXTENSIONS;
}

/** Gera uma chave imutável, por exemplo `posts/2026/10/<uuid>.jpg`. */
export function buildPostImageKey(contentType: PostImageContentType): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `${POST_IMAGE_PREFIX}/${year}/${month}/${randomUUID()}.${
    POST_IMAGE_EXTENSIONS[contentType]
  }`;
}

/**
 * Aceita somente chaves geradas por `buildPostImageKey`.
 * URLs HTTP são aceitas apenas para registros legados.
 */
export function isPostImageKey(value: string): boolean {
  return (
    value.length <= 300 &&
    value.startsWith(`${POST_IMAGE_PREFIX}/`) &&
    !value.includes("..") &&
    !value.includes("//") &&
    /^[a-zA-Z0-9/_.-]+$/.test(value)
  );
}

/** Faz upload do binário já validado pelo route handler. */
export async function uploadPostImageObject(
  key: string,
  body: ArrayBuffer | Uint8Array,
  contentType: PostImageContentType,
): Promise<void> {
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body instanceof Uint8Array ? body : new Uint8Array(body),
      ContentType: contentType,
      CacheControl: "private, max-age=31536000, immutable",
    }),
  );
}

/**
 * Converte a chave salva no Neon em uma URL temporária de leitura.
 * Registros antigos que já guardavam uma URL HTTP continuam funcionando.
 */
export async function getPostImageUrl(
  keyOrUrl: string,
  expiresIn: number = 3600,
): Promise<string> {
  if (/^https?:\/\//i.test(keyOrUrl)) return keyOrUrl;
  if (!isPostImageKey(keyOrUrl)) {
    throw new Error("Caminho de imagem inválido.");
  }

  return getSignedUrl(
    s3(),
    new GetObjectCommand({ Bucket: bucket, Key: keyOrUrl }),
    { expiresIn },
  );
}

/** Remove objetos do bucket. Falhas são ignoradas para não bloquear o banco. */
export async function deletePostImageObjects(keys: string[]): Promise<void> {
  const valid = [...new Set(keys.filter(isPostImageKey))];
  if (valid.length === 0) return;

  await Promise.allSettled(
    valid.map((key) =>
      s3().send(new DeleteObjectCommand({ Bucket: bucket, Key: key })),
    ),
  );
}

export { bucket as postImageBucket };
