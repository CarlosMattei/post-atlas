-- =====================================================================
-- Projeto: Automação de postagens no LinkedIn (n8n)
-- Banco: Neon (PostgreSQL)
-- Versão do schema: 1.1
-- Executar uma vez no SQL Editor do Neon, ou via psql.
-- Idempotência: os comandos usam IF NOT EXISTS / OR REPLACE onde possível.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Tipos
-- ---------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
    CREATE TYPE post_status AS ENUM (
      'rascunho',
      'aprovado',
      'reprovado',
      'agendado',
      'publicando',
      'publicado',
      'erro',
      'arquivado'
    );
  END IF;
END
$$;

ALTER TYPE post_status ADD VALUE IF NOT EXISTS 'reprovado';

-- ---------------------------------------------------------------------
-- 2. Tabela: posts
-- Conteúdo a ser publicado no perfil pessoal do LinkedIn.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS posts (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text          NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  body              text          NOT NULL CHECK (length(body) BETWEEN 1 AND 3000),
  image_path        text,
  image_paths       text[]        NOT NULL DEFAULT '{}',
  image_alts        text[]        NOT NULL DEFAULT '{}',
  tags              text[]        NOT NULL DEFAULT '{}',
  status            post_status   NOT NULL DEFAULT 'rascunho',
  ai_score          smallint      CHECK (ai_score BETWEEN 0 AND 100),
  ai_justification  text,
  score_override    smallint      CHECK (score_override BETWEEN 0 AND 100),
  manual_order      integer,
  scheduled_at      timestamptz,
  published_at      timestamptz,
  linkedin_post_id  text          UNIQUE,
  attempts          smallint      NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error        text,
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now(),

  -- Um post publicado precisa ter data de publicação e ID do LinkedIn
  CONSTRAINT posts_published_consistency CHECK (
    status <> 'publicado'
    OR (published_at IS NOT NULL AND linkedin_post_id IS NOT NULL)
  )
);

COMMENT ON TABLE posts IS 'Posts do LinkedIn: conteúdo, status, score e agendamento.';
COMMENT ON COLUMN posts.image_path IS 'Capa do post (primeira imagem). Mantida para compatibilidade com o workflow.';
COMMENT ON COLUMN posts.image_paths IS 'Chaves dos objetos no bucket de imagens, na ordem do carrossel.';
COMMENT ON COLUMN posts.image_alts IS 'Texto alternativo de cada imagem, na mesma ordem de image_paths.';
COMMENT ON COLUMN posts.ai_score IS 'Score de 0 a 100 atribuído pela IA (OpenRouter), somente com base no texto.';
COMMENT ON COLUMN posts.score_override IS 'Ajuste manual do score. Quando preenchido, prevalece sobre ai_score.';
COMMENT ON COLUMN posts.manual_order IS 'Posição definida manualmente na fila. NULL = ordenar pelo score.';
COMMENT ON COLUMN posts.scheduled_at IS 'Horário fixo de publicação. Posts com este campo não entram na fila diária.';
COMMENT ON COLUMN posts.attempts IS 'Número de tentativas de publicação (incrementar na reserva).';

-- Migração v1.2: upload de imagens no Neon Object Storage.
-- A coluna image_path guarda a capa; image_paths guarda o carrossel completo.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_paths text[] NOT NULL DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_alts text[] NOT NULL DEFAULT '{}';

UPDATE posts
SET image_paths = ARRAY[image_path]
WHERE image_path IS NOT NULL AND cardinality(image_paths) = 0;

-- Índice para a fila diária (posts aprovados, sem horário fixo, não publicados)
CREATE INDEX IF NOT EXISTS idx_posts_queue
  ON posts (manual_order, created_at)
  WHERE status = 'aprovado' AND scheduled_at IS NULL AND linkedin_post_id IS NULL;

-- Índice para posts com horário fixo vencido
CREATE INDEX IF NOT EXISTS idx_posts_scheduled
  ON posts (scheduled_at)
  WHERE status IN ('aprovado', 'agendado') AND scheduled_at IS NOT NULL AND linkedin_post_id IS NULL;

-- Índice para listagens no front-end por status
CREATE INDEX IF NOT EXISTS idx_posts_status_created
  ON posts (status, created_at DESC);

-- ---------------------------------------------------------------------
-- 3. Tabela: schedule_config
-- Configuração única da automação (uma linha, id = 1).
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS schedule_config (
  id                int           PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  publish_time      time          NOT NULL DEFAULT '09:00',
  publish_weekdays  smallint[]    NOT NULL DEFAULT '{1,2,3,4,5}'
                    CHECK (publish_weekdays <@ '{1,2,3,4,5,6,7}'::smallint[]),
  timezone          text          NOT NULL DEFAULT 'America/Sao_Paulo',
  paused            boolean       NOT NULL DEFAULT false,
  min_queue_alert   smallint      NOT NULL DEFAULT 3 CHECK (min_queue_alert >= 0),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE schedule_config IS 'Configuração da automação. Sempre uma linha (id = 1).';
COMMENT ON COLUMN schedule_config.publish_weekdays IS 'Dias ISO: 1 = segunda ... 7 = domingo.';

INSERT INTO schedule_config (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 4. Tabela: publish_logs
-- Histórico de execuções dos workflows.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS publish_logs (
  id           bigserial     PRIMARY KEY,
  post_id      uuid          REFERENCES posts(id) ON DELETE SET NULL,
  workflow     text          NOT NULL,
  result       text          NOT NULL CHECK (result IN ('sucesso', 'erro', 'ignorado')),
  message      text,
  executed_at  timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE publish_logs IS 'Log de execuções dos workflows do n8n.';

CREATE INDEX IF NOT EXISTS idx_logs_post
  ON publish_logs (post_id, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_logs_executed
  ON publish_logs (executed_at DESC);

-- ---------------------------------------------------------------------
-- 5. Tabela: trend_items
-- Temas em alta coletados diariamente de fontes públicas.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trend_items (
  id            bigserial     PRIMARY KEY,
  source        text          NOT NULL,
  sources       text,
  title         text          NOT NULL,
  url           text,
  raw_metric    integer       NOT NULL DEFAULT 0,
  score         smallint      NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  dedupe_key    text          NOT NULL,
  collected_on  date          NOT NULL,
  collected_at  timestamptz   NOT NULL DEFAULT now(),
  status        text          NOT NULL DEFAULT 'novo'
                CHECK (status IN ('novo', 'usado', 'descartado')),

  CONSTRAINT trend_items_unique_per_day UNIQUE (dedupe_key, collected_on)
);

COMMENT ON TABLE trend_items IS 'Temas em alta coletados de HN, Google Trends BR, Wikipedia pt e Mastodon.';

CREATE INDEX IF NOT EXISTS idx_trend_items_day
  ON trend_items (collected_on DESC, score DESC);

CREATE INDEX IF NOT EXISTS idx_trend_items_status
  ON trend_items (status, collected_on DESC);

-- ---------------------------------------------------------------------
-- 6. Funções e triggers
-- ---------------------------------------------------------------------

-- 6.1 Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_posts_updated ON posts;
CREATE TRIGGER trg_posts_updated
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_schedule_config_updated ON schedule_config;
CREATE TRIGGER trg_schedule_config_updated
  BEFORE UPDATE ON schedule_config
  FOR EACH ROW
  EXECUTE FUNCTION touch_updated_at();

-- 6.2 Valida transições de status no banco
-- Regras: publicado é terminal; publicando só vai para publicado ou erro;
-- só posts aprovados podem entrar em publicando.
CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'publicado' THEN
    RAISE EXCEPTION 'Post publicado é imutável (status não pode mudar de publicado para %)', NEW.status;
  END IF;

  IF OLD.status = 'publicando' AND NEW.status NOT IN ('publicado', 'erro') THEN
    RAISE EXCEPTION 'Transição inválida a partir de publicando: %', NEW.status;
  END IF;

  IF NEW.status = 'publicando' AND OLD.status <> 'aprovado' THEN
    RAISE EXCEPTION 'Só posts aprovados podem ser publicados (status atual: %)', OLD.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_status_transition ON posts;
CREATE TRIGGER trg_status_transition
  BEFORE UPDATE OF status ON posts
  FOR EACH ROW
  EXECUTE FUNCTION validate_status_transition();

-- ---------------------------------------------------------------------
-- 7. Permissões (opcional, recomendado)
-- Cria um usuário dedicado para o n8n, com permissões mínimas.
-- Substitua a senha e execute apenas se quiser separar o usuário do
-- proprietário do banco. Caso contrário, use a role padrão do Neon.
-- ---------------------------------------------------------------------

-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'linkedin_n8n') THEN
--     CREATE ROLE linkedin_n8n LOGIN PASSWORD 'TROCAR_POR_SENHA_FORTE';
--   END IF;
-- END
-- $$;
--
-- GRANT USAGE ON SCHEMA public TO linkedin_n8n;
-- GRANT SELECT, INSERT, UPDATE ON posts, schedule_config, publish_logs, trend_items TO linkedin_n8n;
-- GRANT USAGE, SELECT ON SEQUENCE publish_logs_id_seq, trend_items_id_seq TO linkedin_n8n;
-- REVOKE DELETE ON posts FROM linkedin_n8n;

COMMIT;

-- =====================================================================
-- 8. Verificação (execute separadamente após o COMMIT)
-- =====================================================================

-- Tabelas criadas
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('posts', 'schedule_config', 'publish_logs', 'trend_items')
-- ORDER BY table_name;

-- Configuração inicial
-- SELECT * FROM schedule_config;

-- Triggers ativos
-- SELECT tgname, tgrelid::regclass AS tabela
-- FROM pg_trigger
-- WHERE NOT tgisinternal
-- ORDER BY tabela::text, tgname;

-- Fila atual (deve retornar 0 em um banco novo)
-- SELECT COUNT(*) AS fila
-- FROM posts
-- WHERE status = 'aprovado' AND linkedin_post_id IS NULL;
