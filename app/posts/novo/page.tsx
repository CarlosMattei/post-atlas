import type { Metadata } from "next";
import { Button, ButtonLink } from "@/app/components/button";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ImageIcon,
  InfoIcon,
  PlusIcon,
  SendIcon,
  SparklesIcon,
  TagIcon,
  UploadIcon,
} from "@/app/components/icons";
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  PageContainer,
  PageHeader,
  Tag,
  inputClassName,
  labelClassName,
} from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Novo post · Post Atlas",
};

export default function NewPostPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Novo post"
        description="Escreva, revise e defina como o conteúdo entra na rotina de publicação."
        actions={
          <ButtonLink href="/posts" variant="subtle">
            <ArrowLeftIcon className="size-4" />
            Voltar para posts
          </ButtonLink>
        }
      />

      <Alert tone="info" title="O score só é calculado depois de salvar">
        Ao salvar como rascunho, você pode solicitar a avaliação por IA na lista
        de posts. Posts aprovados entram na fila ou no horário fixo.
      </Alert>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="Conteúdo"
              description="Título interno, texto do post e tags de organização."
            />
            <CardBody className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="post-title" className={labelClassName}>
                    Título interno
                  </label>
                  <span className="text-[11px] text-ds-text-subtle">
                    0 / 200
                  </span>
                </div>
                <input
                  id="post-title"
                  type="text"
                  maxLength={200}
                  placeholder="Ex.: Como estruturei meu segundo cérebro no Obsidian"
                  className={inputClassName}
                />
                <p className="mt-1 text-xs leading-4 text-ds-text-subtle">
                  O título não aparece no LinkedIn; serve para organizar a fila.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="post-body" className={labelClassName}>
                    Texto do post
                  </label>
                  <span className="text-[11px] text-ds-text-subtle">
                    0 / 3000
                  </span>
                </div>
                <textarea
                  id="post-body"
                  rows={10}
                  maxLength={3000}
                  placeholder="Comece com o gancho das primeiras linhas. Depois desenvolva o argumento e feche com uma chamada para ação."
                  className={`${inputClassName} h-auto min-h-48 resize-y py-2 leading-6`}
                />
                <p className="mt-1 text-xs leading-4 text-ds-text-subtle">
                  A IA avalia clareza, gancho, valor para o público e chamada
                  para ação.
                </p>
              </div>

              <div>
                <label htmlFor="post-tags" className={labelClassName}>
                  Tags
                </label>
                <div className="relative">
                  <TagIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-subtle" />
                  <input
                    id="post-tags"
                    type="text"
                    placeholder="produtividade, obsidian, pkm"
                    className={`${inputClassName} pl-8`}
                  />
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className="text-[11px] text-ds-text-subtle">
                    Sugestões:
                  </span>
                  <Tag>produtividade</Tag>
                  <Tag>obsidian</Tag>
                  <Tag>n8n</Tag>
                  <Tag>automação</Tag>
                  <Tag>linkedin</Tag>
                </div>
              </div>

              <div>
                <span className={labelClassName}>Imagem opcional</span>
                <label
                  htmlFor="post-image"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-ds-lg border border-dashed border-ds-line bg-ds-surface-hover/40 px-4 py-6 text-center transition-colors hover:bg-ds-surface-hover"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-ds-surface text-ds-text-subtle shadow-ds-raised">
                    <UploadIcon className="size-4" />
                  </span>
                  <span className="mt-2 text-sm font-medium text-ds-text">
                    Arraste uma imagem ou selecione um arquivo
                  </span>
                  <span className="mt-0.5 text-xs text-ds-text-subtle">
                    PNG ou JPG. Redimensionada no navegador antes do upload.
                  </span>
                  <input
                    id="post-image"
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                  />
                </label>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Quando publicar"
              description="A escolha define se o post disputa a fila ou tem horário próprio."
            />
            <CardBody>
              <fieldset>
                <legend className="sr-only">Estratégia de publicação</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-ds-lg border border-ds-line p-3 transition-colors hover:bg-ds-surface-hover">
                    <input
                      type="radio"
                      name="publish-strategy"
                      defaultChecked
                      className="mt-0.5 size-4 accent-[var(--ds-brand)]"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-ds-text">
                        <ClockIcon className="size-4 text-ds-text-subtle" />
                        Entrar na fila
                      </span>
                      <span className="mt-0.5 block text-xs leading-4 text-ds-text-subtle">
                        Publica no próximo dia útil às 09:00, conforme a ordem
                        manual e o score.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-2.5 rounded-ds-lg border border-ds-line p-3 transition-colors hover:bg-ds-surface-hover">
                    <input
                      type="radio"
                      name="publish-strategy"
                      className="mt-0.5 size-4 accent-[var(--ds-brand)]"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-ds-text">
                        <CalendarIcon className="size-4 text-ds-text-subtle" />
                        Data e hora fixas
                      </span>
                      <span className="mt-0.5 block text-xs leading-4 text-ds-text-subtle">
                        Ignora a fila e é verificado a cada 5 minutos até o
                        horário definido.
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>

              <div className="mt-3 max-w-xs">
                <label htmlFor="scheduled-at" className={labelClassName}>
                  Data e hora
                </label>
                <input
                  id="scheduled-at"
                  type="datetime-local"
                  className={inputClassName}
                />
                <p className="mt-1 text-xs leading-4 text-ds-text-subtle">
                  Horário em America/Sao_Paulo.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Score por IA"
              description="Avaliação de 0 a 100 baseada apenas no texto."
              action={<Badge tone="neutral">Não avaliado</Badge>}
            />
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-ds bg-ds-discovery-bg text-ds-discovery-text">
                  <SparklesIcon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ds-text">
                    Salve o rascunho para liberar a avaliação
                  </p>
                  <p className="mt-0.5 text-xs leading-4 text-ds-text-subtle">
                    A justificativa e os pontos fortes e fracos ficam visíveis
                    nos detalhes do post.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" isDisabled>
                <SparklesIcon className="size-3.5" />
                Avaliar agora
              </Button>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader
              title="Pré-visualização"
              description="Como o post aparecerá no LinkedIn."
              action={<Badge tone="neutral">Rascunho</Badge>}
            />
            <CardBody>
              <div className="rounded-ds-lg border border-ds-line">
                <div className="flex items-start gap-2.5 p-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ds-brand text-sm font-semibold text-ds-on-brand">
                    CM
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-5 text-ds-text">
                      Carlos Mattei
                    </p>
                    <p className="line-clamp-1 text-[11px] leading-4 text-ds-text-subtle">
                      Criando sistemas simples para problemas complexos
                    </p>
                    <p className="text-[11px] text-ds-text-subtle">
                      agora · público
                    </p>
                  </div>
                </div>

                <p className="px-3 pb-3 text-sm leading-5 text-ds-text-subtle">
                  O texto do seu post aparecerá aqui. Comece com um gancho
                  forte e mantenha parágrafos curtos para facilitar a leitura.
                </p>

                <div className="flex aspect-[1.91/1] items-center justify-center border-y border-ds-line bg-ds-surface-hover text-ds-text-subtle">
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="size-6" />
                    <span className="text-[11px]">Imagem opcional</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1 px-3 pt-2.5 text-xs font-medium text-ds-info-text">
                  <span>#produtividade</span>
                  <span>#obsidian</span>
                  <span>#pkm</span>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-ds-line px-3 py-2 text-[11px] text-ds-text-subtle">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircleIcon className="size-3.5" />
                    Recomendar
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <InfoIcon className="size-3.5" />
                    Comentar
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <PlusIcon className="size-3.5" />
                    Compartilhar
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <SendIcon className="size-3.5" />
                    Enviar
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Checklist antes de aprovar" />
            <CardBody>
              <ul className="flex flex-col gap-2 text-xs leading-4 text-ds-text-subtle">
                {[
                  "Título entre 1 e 200 caracteres",
                  "Texto entre 1 e 3000 caracteres",
                  "Gancho revisado nas primeiras linhas",
                  "Tags e imagem conferidas",
                  "Estratégia de publicação definida",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-ds-line">
                      <span className="size-1.5 rounded-full bg-ds-text-subtle/40" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardBody>
            <CardFooter>
              <span className="text-[11px] text-ds-text-subtle">
                Prévia sem interação
              </span>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="max-w-xl text-xs leading-4 text-ds-text-subtle">
          Rascunhos podem ser editados a qualquer momento. A aprovação move o
          post para a fila e dispara o score por IA.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink href="/posts" variant="subtle">
            Cancelar
          </ButtonLink>
          <Button variant="outline">Salvar rascunho</Button>
          <Button variant="primary">
            <SendIcon className="size-4" />
            Aprovar post
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
