# Imagens no workflow do n8n

Este documento mostra o que mudou no app e como alterar o workflow
`wf-linkedin-unificado.json` para publicar posts com imagem (uma foto ou
carrossel de até 9).

## O que o app grava

Cada post tem três campos no Neon:

| Coluna | Conteúdo |
|---|---|
| `image_path` | Chave da capa, ex.: `posts/2026/10/<uuid>.jpg`. Mantida para compatibilidade. |
| `image_paths` | Array com todas as chaves, na ordem do carrossel. |
| `image_alts` | Array de textos alternativos, na mesma ordem. |

O bucket é privado. O app gera URLs assinadas válidas por **1 hora** quando o
workflow pede.

## Endpoint para o workflow

```http
GET /api/posts/<uuid-do-post>/images
X-Webhook-Secret: <N8N_WEBHOOK_SECRET>   # só quando a variável está definida
```

Resposta:

```json
{
  "post_id": "3f0e...",
  "image_count": 2,
  "image_url": "https://.../posts/2026/10/a.jpg?X-Amz-...",
  "images": [
    {
      "position": 1,
      "key": "posts/2026/10/a.jpg",
      "alt": "Diagrama da automação",
      "url": "https://.../a.jpg?X-Amz-..."
    },
    {
      "position": 2,
      "key": "posts/2026/10/b.jpg",
      "alt": "Tela do workflow",
      "url": "https://.../b.jpg?X-Amz-..."
    }
  ]
}
```

Sem imagens, `image_count` é `0` e `images` é `[]`.

Teste local:

```bash
curl -H "X-Webhook-Secret: $N8N_WEBHOOK_SECRET" \
  http://localhost:3000/api/posts/<uuid>/images
```

## Alterações no workflow

### 1. Buscar também as colunas de imagem

No nó Postgres que reserva o post da fila e no que reserva posts com horário
fixo, adicione as colunas ao `SELECT`/`RETURNING`:

```sql
SELECT p.id, p.title, p.body, p.image_path, p.image_paths, p.image_alts, ...
```

O restante da regra de fila não muda.

### 2. Buscar as URLs assinadas

Adicione um nó **HTTP Request** depois de "Existe post?" (ramo em que o post
existe):

| Campo | Valor |
|---|---|
| Method | `GET` |
| URL | `http://post-atlas:3000/api/posts/{{ $json.id }}/images` |
| Send Headers | `X-Webhook-Secret: {{ $env.N8N_WEBHOOK_SECRET }}` (se usar segredo) |
| Response Format | `JSON` |

Use o host interno do app na sua rede (Docker/Tailscale). O endpoint só é
chamado pelo n8n, nunca pelo navegador.

### 3. Separar posts com e sem imagem

Adicione um nó **IF** com a expressão:

```text
{{ ($json.image_count ?? 0) > 0 }}
```

- **false** → segue para "Publicar" como hoje, sem `content`.
- **true** → segue para o fluxo de imagens abaixo.

### 4. Fluxo de imagens (executa uma vez por imagem)

1. **Split Out**
   - Field to Split Out: `images`
2. **HTTP Request — Baixar imagem**
   - Method: `GET`
   - URL: `{{ $json.url }}`
   - Response Format: `File`
   - Put Output in Field: `data`
3. **HTTP Request — Inicializar upload**
   - Method: `POST`
   - URL: `https://api.linkedin.com/rest/images?action=initializeUpload`
   - Authentication: a mesma credencial/token do nó de publicar
   - Headers: `LinkedIn-Version: 202610`, `X-Restli-Protocol-Version: 2.0.0`
   - Body (JSON):
     ```json
     {
       "initializeUploadRequest": {
         "owner": "urn:li:person:{{ $('Config').item.json.person_id }}"
       }
     }
     ```
   - A resposta traz `value.uploadUrl` e `value.image` (URN).
4. **HTTP Request — Enviar binário**
   - Method: `PUT`
   - URL: `{{ $json.value.uploadUrl }}`
   - Header: `Authorization: Bearer <token do LinkedIn>`
   - Body Content Type: `n8n Binary File`
   - Input Data Field Name: `data` (o binário baixado no passo 2)
   - Mantenha "Never Error" desligado: se o upload falhar, o post deve ir para
     `erro`.
5. **Code — Montar mídia**
   - Use o nó `Inicializar upload` para recuperar os URNs de todas as imagens:
     ```js
     const images = $items("Inicializar upload")
       .map((item) => item.json)
       .filter((json) => json?.value?.image);

     const content =
       images.length === 0
         ? undefined
         : images.length === 1
           ? {
               media: {
                 id: images[0].value.image,
                 altText: images[0].altText || undefined,
               },
             }
           : {
               multiImage: {
                 images: images.map((json) => ({
                   id: json.value.image,
                   altText: json.altText || undefined,
                 })),
               },
             };

     return [{ json: { content } }];
     ```

   Como o `Split Out` perde o campo `alt`, copie o texto alternativo para cada
   item antes dele (nó **Set** com `altText: {{ $json.alt }}`) ou recupere pelo
   índice em `$items("Buscar imagens")`.

### 5. Publicar com o conteúdo de mídia

No nó que faz `POST https://api.linkedin.com/rest/posts`, inclua `content` no
corpo somente quando houver imagem:

```json
{
  "author": "urn:li:person:{{ $('Config').item.json.person_id }}",
  "commentary": "{{ $('Reservar post').item.json.body }}",
  "visibility": "PUBLIC",
  "distribution": {
    "feedDistribution": "MAIN_FEED",
    "targetEntities": [],
    "thirdPartyDistributionChannels": []
  },
  "content": {{ JSON.stringify($json.content) }},
  "lifecycleState": "PUBLISHED",
  "isReshareDisabledByAuthor": false
}
```

O LinkedIn aceita dois formatos:

- **uma imagem** → `content.media`;
- **duas ou mais** → `content.multiImage.images[]`.

Não envie `media` e `multiImage` juntos. Quando o post não tem imagem, remova
a chave `content` do JSON.

### 6. Aguardar o processamento (recomendado)

Depois do `PUT`, o LinkedIn ainda processa o arquivo. Antes do `POST /rest/posts`,
consulte cada URN:

```http
GET https://api.linkedin.com/rest/images/urn%3Ali%3Aimage%3A<id>
LinkedIn-Version: 202610
```

Use um nó **Wait** de 1–2 segundos e um **IF** até `status === "AVAILABLE"`
(ou configure retry no nó HTTP). Sem isso, posts com imagens grandes podem
falhar de forma intermitente.

## Erros e limpeza

- Se o download ou o upload da imagem falhar, marque o post como `erro` e
  grave a resposta do LinkedIn em `last_error`, igual ao fluxo de texto.
- Se o `POST /rest/posts` falhar, as imagens já enviadas ficam órfãs no
  LinkedIn; o retry cria novos URNs. Isso é aceitável.
- Ao remover uma imagem no app ou excluir o post, o objeto correspondente é
  apagado do bucket automaticamente.
- URLs assinadas expiram em 1 hora. Se o workflow demorar mais que isso entre
  buscar e baixar, busque as URLs novamente.

## Alternativa: acessar o bucket direto do n8n

Se preferir não expor o endpoint do app, configure uma credencial S3 no n8n
com `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e região
`us-east-1`, e use o nó **S3** para baixar o objeto pela chave (`image_paths`).
O endpoint do app é mais simples porque o bucket é privado e o n8n não precisa
guardar credenciais de storage.
