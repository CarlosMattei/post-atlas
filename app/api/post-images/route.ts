import {
  MAX_POST_IMAGE_BYTES,
  POST_IMAGE_EXTENSIONS,
  buildPostImageKey,
  getPostImageUrl,
  isPostImageContentType,
  uploadPostImageObject,
} from "@/app/lib/s3";

/**
 * Recebe uma imagem do formulário, valida e grava no Neon Object Storage.
 *
 * O upload passa pelo servidor Next (e não direto do navegador para o bucket)
 * porque o bucket é privado e não exige configurar CORS para PUT.
 */
export async function POST(request: Request): Promise<Response> {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { erro: "Envie a imagem como multipart/form-data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return Response.json(
      { erro: "Selecione uma imagem para enviar." },
      { status: 400 },
    );
  }

  if (!isPostImageContentType(file.type)) {
    return Response.json(
      {
        erro: `Formato não suportado. Use ${Object.keys(POST_IMAGE_EXTENSIONS)
          .map((type) => type.replace("image/", "").toUpperCase())
          .join(", ")}.`,
      },
      { status: 415 },
    );
  }

  if (file.size > MAX_POST_IMAGE_BYTES) {
    return Response.json(
      { erro: "A imagem pode ter no máximo 10 MB." },
      { status: 413 },
    );
  }

  try {
    const key = buildPostImageKey(file.type);
    await uploadPostImageObject(key, await file.arrayBuffer(), file.type);

    return Response.json(
      { key, url: await getPostImageUrl(key) },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Falha ao enviar imagem do post:", error);

    return Response.json(
      {
        erro:
          error instanceof Error
            ? error.message
            : "Não foi possível gravar a imagem no Neon.",
      },
      { status: 502 },
    );
  }
}
