import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/app/components/button";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "@/app/components/icons";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  PageContainer,
  PageHeader,
  ScorePill,
} from "@/app/components/ui";
import { getTrendItemById } from "@/app/lib/queries";
import type { TrendStatus } from "@/app/lib/types";

export const metadata: Metadata = {
  title: "Detalhes da tendência · Post Atlas",
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(date));
}

function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(date));
}

export default async function TrendDetailPage({
  params,
}: PageProps<"/tendencias/[id]">) {
  const { id } = await params;
  const item = await getTrendItemById(id);
  if (!item) notFound();

  const statusLabel = {
    novo: "Novo",
    usado: "Usado",
    descartado: "Descartado",
  }[item.status];
  const statusTones: Record<TrendStatus, "discovery" | "info" | "neutral"> = {
    novo: "discovery",
    usado: "info",
    descartado: "neutral",
  };

  return (
    <PageContainer>
      <PageHeader
        title="Detalhes da tendência"
        description="Informações do tema coletado para apoiar a avaliação e a curadoria de conteúdo."
        actions={
          <ButtonLink href="/tendencias" variant="subtle">
            <ArrowLeftIcon className="size-4" />
            Voltar para tendências
          </ButtonLink>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Tema coletado"
            description={`Coletado em ${formatDate(item.collectedOn)}`}
            action={<Badge tone={statusTones[item.status]}>{statusLabel}</Badge>}
          />
          <CardBody>
            <h2 className="break-words text-xl font-semibold leading-7 tracking-tight text-ds-text">
              {item.title}
            </h2>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <ScorePill score={item.score} />
              <Badge tone="neutral">{item.source}</Badge>
              {item.sources
                .filter((source) => source !== item.source)
                .map((source) => (
                  <Badge key={source} tone="neutral">
                    {source}
                  </Badge>
                ))}
            </div>

            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-ds border border-ds-line px-3 text-sm font-medium text-ds-text no-underline outline-none transition-colors hover:bg-ds-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
              >
                <ExternalLinkIcon className="size-4" aria-hidden="true" />
                Abrir fonte original
              </a>
            ) : (
              <p className="mt-6 text-sm text-ds-text-subtle">
                Este item não possui link para a fonte original.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Dados da coleta"
            description="Métricas registradas pela busca."
          />
          <CardBody>
            <dl className="divide-y divide-ds-line">
              <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <dt className="text-sm text-ds-text-subtle">Score</dt>
                <dd className="m-0">
                  <ScorePill score={item.score} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-ds-text-subtle">Métrica bruta</dt>
                <dd className="m-0 text-sm font-semibold tabular-nums text-ds-text">
                  {item.rawMetric.toLocaleString("pt-BR")}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-ds-text-subtle">Fontes</dt>
                <dd className="m-0 max-w-[65%] text-right text-sm font-medium text-ds-text">
                  {item.sources.join(", ") || item.source}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3 last:pb-0">
                <dt className="text-sm text-ds-text-subtle">Coletado em</dt>
                <dd className="m-0 max-w-[65%] text-right text-sm font-medium text-ds-text">
                  {formatDateTime(item.collectedAt)}
                </dd>
              </div>
            </dl>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader
            title="Sobre este item"
            description="Como interpretar os dados exibidos."
          />
          <CardBody className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-ds bg-ds-discovery-bg text-ds-discovery-text">
              {item.status === "novo" ? (
                <SparklesIcon className="size-4" />
              ) : (
                <TrendingUpIcon className="size-4" />
              )}
            </span>
            <p className="m-0 max-w-2xl text-sm leading-6 text-ds-text-subtle">
              {item.status === "novo"
                ? "Este tema ainda não foi usado. Avalie a relevância e o contexto antes de transformá-lo em uma pauta."
                : item.status === "usado"
                  ? "Este tema já foi aproveitado em uma pauta."
                  : "Este tema foi descartado da curadoria atual."}
            </p>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}
