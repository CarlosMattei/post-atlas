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
| Autenticação e sessão | Pendente |
| CRUD de posts | Criar, consultar, editar, alterar status e excluir |
| Upload de imagem | Pendente; imagens locais ainda não são persistidas |

> As telas conectadas usam o banco Neon. Outras telas e integrações ainda podem exibir conteúdo estático de `app/lib/data.ts`; n8n, LinkedIn, OpenRouter e Telegram não são chamados diretamente pelo app.

## Telas

| Rota | Tela | Conteúdo |
|---|---|---|
| `/` | Visão geral | Próxima publicação, fila, agendados, publicados, automação, atividade recente e temas em alta |
| `/posts` | Posts | Busca, filtros, tabela com status, score, publicação e ações |
| `/posts/novo` | Novo post | Criação de rascunhos e posts aprovados/agendados no Neon |
| `/posts/[id]` | Detalhes do post | Edição, status, agendamento e exclusão de posts no Neon |
| `/calendario` | Calendário | Posts e rotina do Neon; arrastar e remover datas persiste o agendamento |
| `/tendencias` | Tendências | Busca, filtro, score, status e data de coleta dos temas no Neon |
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
- Calendário de posts conectado ao Neon, com persistência de reagendamentos no fuso da rotina.
- Tendências consultadas do Neon, com busca, filtro por status e páginas de detalhes.
- Dashboard com posts, agenda, logs recentes e tendências consultados no Neon.
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
                            LinkedIn    OpenRouter    Telegram
```

As consultas e mutações ao Neon são executadas no servidor pela biblioteca `pg`. As credenciais não devem ser expostas ao navegador.

## Modelo de dados

Definido em `neon-schema.sql`:

| Tabela | Responsabilidade |
|---|---|
| `posts` | Conteúdo, status, score, ordem manual, agendamento, publicação e último erro |
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
│  │  ├─ sidebar.tsx
│  │  └─ ui.tsx
│  └─ lib/
│     ├─ cx.ts
│     ├─ data.ts
│     ├─ db.ts
│     ├─ format.ts
│     ├─ post-actions.ts
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
- [ ] Configurar upload persistente de imagens
- [ ] Conectar os filtros de posts/logs e as demais telas ao banco
- [ ] Implementar `X-Webhook-Secret` no webhook de score
- [ ] Adicionar testes de componentes e fluxos críticos

## Documentação

O projeto segue o **TDD v1.1 — Automação de Postagens no LinkedIn com n8n**, mantido no Obsidian. A estrutura das telas está documentada na nota `front-end-estrutura-telas-v1`.

## Licença

Projeto pessoal sem licença definida.
