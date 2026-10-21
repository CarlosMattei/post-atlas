import { getPostById } from "@/app/lib/queries";

/**
 * Endpoint de leitura usado pelo workflow do n8n antes de publicar no LinkedIn.
 *
 * GET /api/posts/<uuid>/images
 * Header opcional: X-Webhook-Secret: <N8N_WEBHOOK_SECRET>
 *
 * Devolve URLs temporárias (1 hora) para o n8n baixar o binário de cada imagem.
 * O bucket é privado, então essas URLs assinadas são a forma mais simples de o
 * workflow obter o arquivo sem guardar credenciais S3 no n8n.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const secret = process.env.N8N_WEBHOOK_SECRET?.trim();

  if (secret && request.headers.get("x-webhook-secret") !== secret) {
    return Response.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return Response.json({ erro: "Post não encontrado." }, { status: 404 });
  }

  const images = (post.images ?? []).map((image, index) => ({
    position: index + 1,
    key: image.key ?? null,
    alt: image.alt || null,
    url: image.url,
  }));

  return Response.json(
    {
      post_id: post.id,
      image_count: images.length,
      image_url: images[0]?.url ?? null,
      images,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
