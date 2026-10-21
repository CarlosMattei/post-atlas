import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/app/components/button";
import {
  ArrowUpRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  InfoIcon,
  PlusIcon,
  PostsIcon,
  SendIcon,
  SettingsIcon,
  SparklesIcon,
  TrendingUpIcon,
  XCircleIcon,
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
  ScorePill,
  StatCard,
  StatusBadge,
} from "@/app/components/ui";
import {
  weekdayLabels,
} from "@/app/lib/data";
import { getHomeDashboardData } from "@/app/lib/queries";
import {
  effectiveScore,
  formatDay,
  formatDateTime,
  formatMonthShort,
  formatTime,
  formatWeekdayDate,
  truncate,
  workflowLabels,
} from "@/app/lib/format";

export const metadata: Metadata = {
  title: "Visão geral · Post Atlas",
};

export const instant = false;

export default async function HomePage() {
  const { posts, publishLogs, scheduleConfig, trendItems, newTrendCount } =
    await getHomeDashboardData();
  const queue = posts
    .filter(
      (post) =>
        post.status === "aprovado" &&
        post.scheduledAt === null &&
        post.linkedinPostId === null,
    )
    .sort((a, b) => {
      if (a.manualOrder !== null || b.manualOrder !== null) {
        return (
          (a.manualOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.manualOrder ?? Number.MAX_SAFE_INTEGER)
        );
      }
      const scoreDiff = effectiveScore(b) - effectiveScore(a);
      return scoreDiff !== 0
        ? scoreDiff
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  const scheduled = posts
    .filter(
      (post) =>
        post.scheduledAt !== null &&
        (post.status === "agendado" || post.status === "aprovado"),
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime(),
    );

  const month = new Date().toISOString().slice(0, 7);
  const publishedThisMonth = posts.filter((post) =>
    post.publishedAt?.startsWith(month),
  );

  const upcoming = [
    ...scheduled.map((post) => ({
      post,
      kind: "scheduled" as const,
      order: null,
    })),
    ...queue.slice(0, 2).map((post, index) => ({
      post,
      kind: "queue" as const,
      order: index + 1,
    })),
  ];

  const nextRun = scheduled[0]?.scheduledAt ?? null;
  const recentLogs = publishLogs;
  const highlightedTrends = trendItems;
  const activeWeekdays = scheduleConfig.publishWeekdays
    .map((day) => weekdayLabels[day])
    .join("–");
  const latestPublished = posts
    .filter((post) => post.publishedAt)
    .sort(
      (a, b) =>
        new Date(b.publishedAt!).getTime() -
        new Date(a.publishedAt!).getTime(),
    )[0];

  return (
    <PageContainer>
      <PageHeader
        title="Visão geral"
        description="Acompanhe a fila, as próximas publicações e a saúde da automação."
        actions={
          <>
            <ButtonLink href="/configuracoes" variant="outline">
              <SettingsIcon className="size-4" />
              Ajustar rotina
            </ButtonLink>
            <ButtonLink href="/posts/novo" variant="primary">
              <PlusIcon className="size-4" />
              Novo post
            </ButtonLink>
          </>
        }
      />

      {scheduleConfig.paused ? (
        <Alert
          tone="warning"
          title="Rotina de publicação pausada"
          action={
            <ButtonLink href="/configuracoes" variant="standard" size="sm">
              Revisar rotina
              <ArrowUpRightIcon className="size-3.5" />
            </ButtonLink>
          }
        >
          A automação está pausada nas configurações de agenda.
        </Alert>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Próxima publicação"
          value={nextRun ? `${formatDay(nextRun)} ${formatMonthShort(nextRun)} · ${formatTime(nextRun)}` : "—"}
          hint={scheduled[0]?.title ?? "Nenhum post agendado"}
          icon={ClockIcon}
        />
        <StatCard
          label="Na fila"
          value={`${queue.length} posts`}
          hint={`${queue.filter((post) => post.manualOrder !== null).length} com prioridade manual`}
          icon={PostsIcon}
        />
        <StatCard
          label="Agendados"
          value={`${scheduled.length} posts`}
          hint={`${scheduled.filter((post) => post.status === "agendado").length} por horário fixo`}
          icon={CalendarIcon}
        />
        <StatCard
          label="Publicados no mês"
          value={String(publishedThisMonth.length)}
          hint={
            latestPublished?.publishedAt
              ? `Última em ${formatDateTime(latestPublished.publishedAt)}`
              : "Nenhuma publicação ainda"
          }
          icon={CheckCircleIcon}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Próximas publicações"
            description="Horários fixos e fila ordenada por prioridade efetiva."
            action={
              <ButtonLink href="/calendario" variant="subtle" size="sm">
                Abrir calendário
                <ArrowUpRightIcon className="size-3.5" />
              </ButtonLink>
            }
          />

          <ul className="divide-y divide-ds-line">
            {upcoming.map(({ post, kind, order }) => (
              <li
                key={post.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ds-surface-hover/60"
              >
                <div
                  className={
                    kind === "scheduled"
                      ? "flex size-10 shrink-0 flex-col items-center justify-center rounded-ds bg-ds-info-bg text-ds-info-text"
                      : "flex size-10 shrink-0 items-center justify-center rounded-ds bg-ds-surface-hover text-sm font-semibold text-ds-text-subtle tabular-nums"
                  }
                >
                  {kind === "scheduled" ? (
                    <>
                      <span className="text-sm font-semibold leading-4">
                        {formatDay(post.scheduledAt!)}
                      </span>
                      <span className="text-[10px] uppercase leading-3">
                        {formatMonthShort(post.scheduledAt!)}
                      </span>
                    </>
                  ) : (
                    <span>#{order}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ds-text">
                    {post.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ds-text-subtle">
                    <span>
                      {kind === "scheduled"
                        ? `${formatTime(post.scheduledAt!)} · Horário fixo`
                        : `${order === 1 ? "Próximo da fila" : `${order}º na fila`}${
                            post.manualOrder !== null
                              ? " · prioridade manual"
                              : ""
                          }`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <StatusBadge status={post.status} />
                  </div>
                </div>

                <ScorePill score={effectiveScore(post)} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Automação"
            description="Rotina de publicação no fuso de São Paulo."
            action={
              <Badge tone={scheduleConfig.paused ? "warning" : "success"}>
                {scheduleConfig.paused ? "Pausada" : "Ativa"}
              </Badge>
            }
          />
          <CardBody className="flex-1">
            <div className="rounded-ds-lg bg-ds-surface-hover px-3 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle">
                Próxima execução
              </p>
              <p className="mt-1 text-lg font-semibold leading-6 text-ds-text">
                {nextRun ? formatWeekdayDate(nextRun) : "—"}
              </p>
              <p className="text-sm text-ds-text-subtle">
                {nextRun
                  ? `${formatTime(nextRun)} · ${scheduleConfig.timezone}`
                  : "Sem execução agendada"}
              </p>
            </div>

            <dl className="mt-3 divide-y divide-ds-line text-sm">
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-ds-text-subtle">Rotina</dt>
                <dd className="font-medium text-ds-text">
                  {scheduleConfig.publishTime} · {activeWeekdays}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-ds-text-subtle">Dias ativos</dt>
                <dd className="font-medium text-ds-text">
                  {scheduleConfig.publishWeekdays
                    .map((day) => weekdayLabels[day])
                    .join(", ")}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-ds-text-subtle">Alerta de fila</dt>
                <dd className="font-medium text-ds-text">
                  abaixo de {scheduleConfig.minQueueAlert} posts
                </dd>
              </div>
            </dl>
          </CardBody>
          <CardFooter>
            <span className="text-xs text-ds-text-subtle">
              5 seções ativas no n8n
            </span>
            <ButtonLink href="/configuracoes" variant="subtle" size="sm">
              Configurar
              <ArrowUpRightIcon className="size-3.5" />
            </ButtonLink>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Atividade recente"
            description="Últimas execuções registradas em publish_logs."
            action={
              <ButtonLink href="/logs" variant="subtle" size="sm">
                Ver todos os logs
                <ArrowUpRightIcon className="size-3.5" />
              </ButtonLink>
            }
          />
          <ul className="divide-y divide-ds-line">
            {recentLogs.map((log) => {
              const Icon =
                log.result === "erro"
                  ? XCircleIcon
                  : log.result === "ignorado"
                    ? InfoIcon
                    : CheckCircleIcon;
              const iconClass =
                log.result === "erro"
                  ? "text-ds-danger-text"
                  : log.result === "ignorado"
                    ? "text-ds-text-subtle"
                    : "text-ds-success-text";

              return (
                <li
                  key={log.id}
                  className="flex items-start gap-3 px-4 py-2.5"
                >
                  <Icon className={`mt-0.5 size-4 shrink-0 ${iconClass}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <p className="text-xs font-semibold text-ds-text">
                        {workflowLabels[log.workflow]}
                      </p>
                      <time className="text-[11px] text-ds-text-subtle">
                        {formatWeekdayDate(log.executedAt)} ·{" "}
                        {formatTime(log.executedAt)}
                      </time>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs leading-4 text-ds-text-subtle">
                      {truncate(log.message, 110)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Temas em alta"
            description="Coletados hoje pela busca de conteúdo."
            action={
              <div className="flex items-center gap-2">
                <Badge tone="discovery">{newTrendCount} novos</Badge>
                <ButtonLink href="/tendencias" variant="subtle" size="sm">
                  Ver todos
                  <ArrowUpRightIcon className="size-3.5" />
                </ButtonLink>
              </div>
            }
          />
          <ul className="divide-y divide-ds-line">
            {highlightedTrends.map((trend) => (
              <li key={trend.id}>
                <Link
                  href={`/tendencias/${trend.id}`}
                  aria-label={`Ver detalhes da tendência: ${trend.title}`}
                  className="block px-4 py-2.5 no-underline outline-none transition-colors hover:bg-ds-surface-hover/60 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-ds-focus"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-xs font-medium leading-4 text-ds-text">
                      {trend.title}
                    </p>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-ds-discovery-text tabular-nums">
                      <SparklesIcon className="size-3.5" />
                      {trend.score}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-ds-text-subtle">
                    <span className="truncate">{trend.sources.join(" · ")}</span>
                    <span className="inline-flex items-center gap-1">
                      <TrendingUpIcon className="size-3" />
                      {trend.status === "novo" ? "Novo" : "Usado"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <CardFooter>
            <span className="text-xs text-ds-text-subtle">
              Busca diária às 07:00
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-ds-text-subtle">
              <SendIcon className="size-3.5" />
              Rascunhos a partir de temas
            </span>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
