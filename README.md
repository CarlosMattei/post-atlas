<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/postAtlas-logo-white.svg">
  <img src="public/postAtlas._logoAndTypograpysvg.svg" alt="Post Atlas" width="360">
</picture>

Front-end de gestão para uma automação de publicações no LinkedIn, construído em Next.js com React Aria e design tokens baseados no Atlassian Design.

O projeto organiza rascunhos, aprovações, fila, agendamentos, arquivados, conexões, configurações e logs. O fluxo completo previsto no TDD usa o n8n como orquestrador, PostgreSQL self-hosted, OpenRouter para o score por IA e Telegram para alertas.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![React Aria](https://img.shields.io/badge/React_Aria-1.22-7C3AED)](https://react-spectrum.adobe.com/react-aria/)

## Status

| Camada | Estado |
|---|---|
| Interface (este repositório) | Telas navegáveis com integrações parciais ao Neon |
| Automação n8n | Especificada no TDD v1.1, fora deste repositório |
| Banco Neon/PostgreSQL | Schema em `neon-schema.sql`; posts, agenda e tendências consultados pelo app |
| Integração front-end ↔ banco | Parcial: posts, calendário, dashboard e tendências |
| Webhook do n8n | Chamado pelo servidor para transformar uma tendência em post |
| Autenticação e sessão | Pendente |
| CRUD de posts | Criar, consultar, editar, alterar status e excluir |
| Ações rápidas da fila | Editar, aprovar, arquivar e excluir direto na tabela de posts |
| Upload de imagem | Implementado: imagens são comprimidas no navegador e gravadas no Neon Object Storage |

> As telas conectadas usam o banco Neon. Outras telas e integrações ainda podem exibir conteúdo estático de `app/lib/data.ts`; n8n, LinkedIn, OpenRouter e Telegram não são chamados diretamente pelo app.

## Telas

| Rota | Tela | Conteúdo |
|---|---|---|
| `/` | Visão geral | Próxima publicação, fila, agendados, publicados, automação, atividade recente e temas em alta |
| `/posts` | Posts | Busca, filtros, tabela com status, score, publicação, ações rápidas (editar, aprovar, arquivar, excluir) e o botão "Avaliar scores", que envia ao n8n os posts sem `ai_score` |
| `/posts/novo` | Novo post | Criação de rascunhos e posts aprovados/agendados no Neon, com upload de até 9 imagens |
| `/posts/[id]` | Detalhes do post | Edição, imagens (capa, ordem e texto alternativo), status, agendamento e exclusão |
| `/calendario` | Calendário | Posts e rotina do Neon; arrastar e remover datas persiste o agendamento |
| `/tendencias` | Tendências | Busca, filtro, score, status e data de coleta dos temas no Neon; cada tema pode virar post pelo webhook do n8n |
| `/tendencias/[id]` | Detalhes da tendência | Fontes, score, métrica bruta, data e link original |
| `/arquivados` | Arquivados | Conteúdos fora de circulação com ação de restauração |
| `/conexao` | Conexão | Status de LinkedIn, n8n, OpenRouter, Telegram e PostgreSQL |
| `/logs` | Logs | Histórico de execuções com filtros por workflow, resultado e período |
| `/configuracoes` | Configurações | Horário, dias, fuso, pausa, alerta de fila, webhook e token |
| `/sair` | Sair | Confirmação de encerramento de sessão |

## Funcionalidades da estrutura

- Shell com sidebar, navegação por rotas e estado ativo.
- Tema claro e escuro via `prefers-color-scheme`.
- CRUD de posts conectado ao Neon, com validação no servidor e invalidação das rotas afetadas.
- Upload de até 9 imagens por post no Neon Object Storage, com redimensionamento no navegador, capa, ordem e texto alternativo.
- Remoção de imagens também apaga o objeto do bucket; excluir o post limpa todas as imagens.
- Ações rápidas na tabela de posts: editar, aprovar, arquivar, restaurar e excluir sem sair da lista.
- Tendências transformadas em post pelo webhook do n8n, com retorno em toast para sucesso e erro.
- "Avaliar scores" em `/posts` manda ao n8n os posts em rascunho/aprovado ainda sem nota e recarrega a tabela.
- Calendário de posts conectado ao Neon, com persistência de reagendamentos no fuso da rotina.
- Tendências consultadas do Neon, com busca, filtro por status e páginas de detalhes.
- Dashboard com posts, agenda, logs recentes e tendências consultados no Neon.
- Estados de carregamento com skeletons em todas as rotas, com anúncio para leitores de tela e respeito a `prefers-reduced-motion`.
- Tabelas com status, score efetivo e datas formatadas em `America/Sao_Paulo`.
- Lozenges de status, badges de resultado e indicadores de score.
- Formulários com `label`, `fieldset/legend` e textos de apoio.
- Pré-visualização do post no formato do LinkedIn.
- Componentes acessíveis com React Aria: links, botões, switch e toggle group.
- Skip link, foco visível e `aria-current` na navegação.

## Stack

| Tecnologia | Uso |
|---|---|
| [Next.js 16](https://nextjs.org) | App Router, renderização no servidor e rotas |
| [React 19](https://react.dev) | Interface |
| [React Aria Components](https://react-spectrum.adobe.com/react-aria/) | Componentes e interações acessíveis |
| [Tailwind CSS 4](https://tailwindcss.com) | Estilos e tokens utilitários |
| [TypeScript 5](https://www.typescriptlang.org) | Tipagem do modelo de dados e componentes |
| [Neon](https://neon.tech) | PostgreSQL gerenciado e Object Storage compatível com S3 |
| [AWS SDK v3](https://aws.amazon.com/sdk-for-javascript/) | Assinatura de URLs e operações no bucket de imagens |

## Design system

Os tokens ficam em `app/globals.css` e seguem a lógica do Atlassian Design:

- superfícies, texto, bordas e cores semânticas;
- feedback de sucesso, atenção, perigo, informação e descoberta;
- raios de 3 px e 6 px;
- sombras `raised` e `overlay`;
- tipografia de 11 a 24 px com foco em leitura densa;
- foco com outline de 2 px e offset de 2 px.

Componentes reutilizáveis:

```text
app/components/
  button.tsx        # Button e ButtonLink com variantes
  ui.tsx            # Card, Badge, Alert, StatCard, ScorePill, EmptyState
  posts-table.tsx   # tabela compartilhada de posts e arquivados
  post-row-actions.tsx # menu de ações rápidas de cada linha da tabela
  trend-post-button.tsx # botão que envia a tendência ao webhook do n8n
  toast.tsx         # notificações temporárias de sucesso e erro
  settings-form.tsx # formulário interativo de configurações
  sidebar.tsx       # navegação principal
  icons.tsx         # ícones SVG
```

## Arquitetura

```text
┌──────────────────────────┐
│ Front-end (Next.js)      │
│ telas + componentes      │
└────────────┬─────────────┘
             │ PostgreSQL (pg)
             ▼
┌──────────────────────────┐        ┌──────────────────┐
│ Neon (PostgreSQL)        │◄──────►│ n8n              │
│ posts, schedule_config,  │  SQL   │ workflow único   │
│ publish_logs, trend_items│        └───────┬──────────┘
└──────────────────────────┘                │
                                ┌───────────┼────────────┐
                                ▼           ▼            ▼
                            LinkedIn    NvidiaNIM    Telegram
```

As consultas e mutações ao Neon são executadas no servidor pela biblioteca `pg`. As credenciais não devem ser expostas ao navegador.

## Modelo de dados

Definido em `neon-schema.sql`:

| Tabela | Responsabilidade |
|---|---|
| `posts` | Conteúdo, imagens (`image_paths`/`image_alts`), status, score, ordem manual, agendamento, publicação e último erro |
| `schedule_config` | Horário, dias úteis, fuso, pausa e limite do alerta de fila |
| `publish_logs` | Registros de execução por workflow, resultado e mensagem |
| `trend_items` | Temas coletados, fontes, score de relevância e status |

### Status do post

```text
rascunho → aprovado → publicando → publicado
                │          │
                │          └──→ erro ──→ aprovado
                └──→ agendado
qualquer status (exceto publicando) → arquivado → rascunho
```

O score efetivo usa `COALESCE(score_override, ai_score, 0)`. A fila respeita a ordem manual, depois o score efetivo e, por fim, a data de criação.

## Estrutura do projeto

```text
post-atlas/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ globals.css
│  ├─ api/
│  │  ├─ post-images/route.ts        # upload de imagem (multipart)
│  │  └─ posts/[id]/images/route.ts  # URLs assinadas para o n8n
│  ├─ posts/
│  │  ├─ page.tsx
│  │  ├─ novo/page.tsx
│  │  └─ [id]/page.tsx
│  ├─ calendario/page.tsx
│  ├─ tendencias/
│  │  ├─ page.tsx
│  │  └─ [id]/page.tsx
│  ├─ arquivados/page.tsx
│  ├─ conexao/page.tsx
│  ├─ logs/page.tsx
│  ├─ configuracoes/page.tsx
│  ├─ sair/page.tsx
│  ├─ components/
│  │  ├─ button.tsx
│  │  ├─ icons.tsx
│  │  ├─ posts-table.tsx
│  │  ├─ settings-form.tsx
│  │  ├─ skeletons.tsx
│  │  ├─ sidebar.tsx
│  │  └─ ui.tsx
│  └─ lib/
│     ├─ cx.ts
│     ├─ data.ts
│     ├─ db.ts
│     ├─ format.ts
│     ├─ post-actions.ts
│     ├─ s3.ts
│     ├─ upload-image.ts
│     ├─ trend-actions.ts
│     ├─ queries.ts
│     └─ types.ts
├─ public/
├─ neon-schema.sql
├─ next.config.ts
├─ package.json
└─ tsconfig.json
```

## Como rodar

### Pré-requisitos

- Node.js 20.9 ou superior
- npm
- Banco Neon com o schema aplicado

### Instalação

```bash
git clone https://github.com/<seu-usuario>/post-atlas.git
cd post-atlas
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Configure `NEON_CONNECTION_STRING` no `.env.local` com a URL de conexão PostgreSQL do Neon:

```env
NEON_CONNECTION_STRING=postgresql://usuario:senha@host/neondb?sslmode=require
```

O upload usa o Object Storage do Neon, compatível com S3. Gere as credenciais no painel do Neon e preencha:

```env
# Endpoint do bucket (sem barra no final).
AWS_ENDPOINT_URL_S3=https://<seu-projeto>.storage.<região>.aws.neon.tech
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# Opcional. O padrão é "uploads", o bucket já criado no Neon.
S3_BUCKET=uploads
```

O bucket permanece privado. O navegador envia o arquivo para `POST /api/post-images`; o servidor
valida tipo/tamanho, grava o objeto e devolve apenas a chave `posts/AAAA/MM/<uuid>.<ext>` e uma URL
assinada temporária para a prévia. As credenciais S3 nunca chegam ao cliente. O workflow do n8n lê as
imagens por `GET /api/posts/<uuid>/images` — veja [docs/n8n-imagens.md](docs/n8n-imagens.md).

O webhook do n8n usado por "Transformar em post" é opcional e tem um valor padrão:

```env
# URL do webhook que recebe a tendência e cria o rascunho no fluxo do n8n.
N8N_TREND_POST_WEBHOOK_URL=http://umbrel.local:5678/webhook/linkedin-trend-post

# URL do webhook que avalia um post sem score (botão "Avaliar scores" em /posts).
N8N_SCORE_POST_WEBHOOK_URL=http://umbrel.local:5678/webhook/linkedin-score-post

# Enviado no header X-Webhook-Secret quando definido.
N8N_WEBHOOK_SECRET=
```

A chamada é feita pelo servidor (`app/lib/trend-actions.ts` e `app/lib/score-actions.ts`), então o
endereço interno do n8n não fica exposto no navegador e não sofre com CORS. O workflow responde com
`200 { "mensagem": ..., "post_id": ..., "trend_id": ... }` quando o rascunho é criado e com
`500 { "erro": "..." }` quando a tendência não existe ou a IA não devolve um rascunho válido.
Nos dois casos a resposta vira um toast: sucesso com a mensagem do n8n, erro com o texto devolvido.

"Transformar em post" cria um rascunho por vez. "Avaliar scores" percorre os posts em `rascunho` ou
`aprovado` com `ai_score` nulo, manda até 12 por clique em lotes de três chamadas paralelas (45 s de
limite por post) e recarrega a tabela com as notas gravadas pelo n8n. Cada post é uma chamada de IA,
por isso o limite: o que sobrar aparece no toast e é avaliado no clique seguinte.

O workflow tem dois webhooks separados: `linkedin-trend-post` (tendência → rascunho, usado por esta
tela) e `linkedin-score-post` (`{ "post_id": "uuid" }` → `ai_score` + `ai_justification`). Para testar
os botões no editor do n8n, troque `/webhook/` por `/webhook-test/` na URL e clique em
"Listen for test event" no nó correspondente antes de disparar.

Todos os nós Postgres do workflow precisam usar a mesma credencial do Neon. Um erro comum é o nó
"Buscar post para avaliar1" ficar ligado a uma credencial antiga (banco com `posts.id` bigint), o que
devolve `invalid input syntax for type bigint: "<uuid>"` — a consulta compara `id::text` justamente
para não depender do tipo da coluna, mas o banco também precisa ser o mesmo que o app lê.

Não versione credenciais. O arquivo `.env.local` deve permanecer fora do Git.

### Build de produção

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

### Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com Turbopack |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | Análise estática com ESLint |
| `npm test` | Testes unitários de regras do formulário |

## Segurança

- Não versione tokens do LinkedIn, chaves do OpenRouter, tokens do Telegram ou credenciais do PostgreSQL.
- `NEON_CONNECTION_STRING` é lida somente no servidor e deve ser mantida em variável de ambiente privada.
- O webhook de score ainda não valida `X-Webhook-Secret`; restrinja o acesso pela rede local ou Tailscale até implementar a validação.
- O app chama os dois webhooks do n8n pelo servidor; as URLs internas ficam em `N8N_TREND_POST_WEBHOOK_URL` e `N8N_SCORE_POST_WEBHOOK_URL`.
- Prefira credenciais nativas do n8n em vez de segredos escritos nos nós HTTP.
- O token do LinkedIn expira em aproximadamente 60 dias e precisa de reautorização.
- A autenticação do front-end ainda será definida. Não exponha a aplicação publicamente antes disso.

## Roadmap

- [x] Shell, sidebar e design tokens
- [x] Estrutura das telas principais
- [x] Schema PostgreSQL/Neon
- [x] CRUD de posts sem upload de imagens
- [x] Dashboard, calendário e tendências conectados ao Neon
- [x] Componentes acessíveis com layout adaptável
- [ ] Definir autenticação e proteção de rotas
- [x] Configurar upload persistente de imagens
- [ ] Conectar os filtros de posts/logs e as demais telas ao banco
- [ ] Implementar `X-Webhook-Secret` no webhook de score
- [ ] Adicionar testes de componentes e fluxos críticos

## Documentação

O projeto segue o **TDD v1.1 — Automação de Postagens no LinkedIn com n8n**, mantido no Obsidian. A estrutura das telas está documentada na nota `front-end-estrutura-telas-v1`.

## Licença

Projeto pessoal sem licença definida.
