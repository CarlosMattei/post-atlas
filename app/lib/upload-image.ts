"use client";

/** Maior lado da imagem enviada ao bucket. */
const MAX_DIMENSION = 1920;

/** Imagens pequenas e já otimizadas são enviadas sem reencode. */
const KEEP_ORIGINAL_BYTES = 2 * 1024 * 1024;

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type UploadedPostImage = {
  key: string;
  url: string;
};

/**
 * Redimensiona no navegador antes de enviar, para economizar banda e storage.
 * GIFs passam direto para preservar a animação.
 */
async function prepareImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );

    if (scale === 1 && file.size <= KEEP_ORIGINAL_BYTES) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }

    // JPEG não tem transparência; fundo branco evita faixas pretas.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );

    if (!blob) return file;

    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, "") || "imagem"}.jpg`,
      { type: "image/jpeg" },
    );
  } catch {
    // Navegador sem createImageBitmap/canvas: envia o original.
    return file;
  }
}

/**
 * Envia uma imagem ao bucket privado pelo route handler do app.
 * Devolve a chave que deve ser salva no Neon e uma URL temporária de prévia.
 */
export async function uploadPostImage(file: File): Promise<UploadedPostImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem.");
  }

  const prepared = await prepareImage(file);

  if (prepared.size > MAX_UPLOAD_BYTES) {
    throw new Error("A imagem pode ter no máximo 10 MB.");
  }

  const body = new FormData();
  body.append("file", prepared, prepared.name);

  const response = await fetch("/api/post-images", {
    method: "POST",
    body,
  });

  const payload = (await response.json().catch(() => null)) as
    | { key?: string; url?: string; erro?: string }
    | null;

  if (!response.ok || !payload?.key || !payload.url) {
    throw new Error(payload?.erro ?? "Não foi possível enviar a imagem.");
  }

  return { key: payload.key, url: payload.url };
}
