import type { Metadata } from "next";
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
  posts,
  publishLogs,
  queue,
  scheduleConfig,
  trendItems,
  weekdayLabels,
} from "@/app/lib/data";
import {
  effectiveScore,
  formatDay,
  formatMonthShort,
  formatTime,
  formatWeekdayDate,
  truncate,
  workflowLabels,
} from "@/app/lib/format";

export const metadata: Metadata = {
  title: "Visão geral · Post Atlas",
};

export default function HomePage() {
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

  const publishedThisMonth = posts.filter((post) =>
    post.publishedAt?.startsWith("2026-10"),
  ).length;

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
  const recentLogs = publishLogs.slice(0, 5);
  const highlightedTrends = trendItems.slice(0, 4);

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

      <Alert
        tone="warning"
        title="O token do LinkedIn expira em 12 dias"
        action={
          <ButtonLink href="/conexao" variant="standard" size="sm">
            Revisar conexão
            <ArrowUpRightIcon className="size-3.5" />
          </ButtonLink>
        }
      >
        Reautorize antes de 31 de outubro para evitar falhas na publicação da
        fila.
      </Alert>

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
          hint="1 com prioridade manual"
          icon={PostsIcon}
        />
        <StatCard
          label="Agendados"
          value={`${scheduled.length} posts`}
          hint="Publicação por horário fixo"
          icon={CalendarIcon}
        />
        <StatCard
          label="Publicados no mês"
          value={String(publishedThisMonth)}
          hint="Última publicação hoje, 09:00"
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
            action={<Badge tone="success">Ativa</Badge>}
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
                  {scheduleConfig.publishTime} · Seg–Sex
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
            action={<Badge tone="discovery">12 novos</Badge>}
          />
          <ul className="divide-y divide-ds-line">
            {highlightedTrends.map((trend) => (
              <li key={trend.id} className="px-4 py-2.5">
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
