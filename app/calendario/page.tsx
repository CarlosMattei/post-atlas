import type { Metadata } from "next";
import { Button, ButtonLink } from "@/app/components/button";
import {
  ArrowUpRightIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@/app/components/icons";
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  PageContainer,
  PageHeader,
  ScorePill,
  StatusBadge,
  Tag,
} from "@/app/components/ui";
import {
  posts,
  queue,
  scheduleConfig,
  weekdayLabels,
} from "@/app/lib/data";
import {
  effectiveScore,
  formatDay,
  formatMonthShort,
  formatTime,
  formatWeekday,
} from "@/app/lib/format";

export const metadata: Metadata = {
  title: "Calendário · Post Atlas",
};

const week = [
  { date: "2026-10-19", weekday: "Seg", day: "19", today: true },
  { date: "2026-10-20", weekday: "Ter", day: "20", today: false },
  { date: "2026-10-21", weekday: "Qua", day: "21", today: false },
  { date: "2026-10-22", weekday: "Qui", day: "22", today: false },
  { date: "2026-10-23", weekday: "Sex", day: "23", today: false },
  { date: "2026-10-24", weekday: "Sáb", day: "24", today: false },
  { date: "2026-10-25", weekday: "Dom", day: "25", today: false },
];

export default function CalendarPage() {
  const scheduledPosts = posts
    .filter((post) => post.scheduledAt !== null)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime(),
    );

  return (
    <PageContainer>
      <PageHeader
        title="Calendário"
        description="Alterne entre a rotina de dias úteis e os posts com data e hora fixas."
        actions={
          <>
            <ButtonLink href="/configuracoes" variant="outline">
              <CalendarIcon className="size-4" />
              Configurar rotina
            </ButtonLink>
            <ButtonLink href="/posts/novo" variant="primary">
              <PlusIcon className="size-4" />
              Novo post
            </ButtonLink>
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ds-line px-4 py-3">
          <div className="flex items-center gap-1">
            <Button
              variant="subtle"
              size="icon-sm"
              aria-label="Semana anterior"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <h2 className="min-w-48 px-2 text-sm font-semibold text-ds-text">
              19 – 25 de outubro de 2026
            </h2>
            <Button
              variant="subtle"
              size="icon-sm"
              aria-label="Próxima semana"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
            <Button variant="outline" size="sm" className="ml-1">
              Hoje
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-ds-text-subtle">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-ds-info-text" />
              Horário fixo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full border border-dashed border-ds-text-subtle" />
              Rotina da fila
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-ds-success-text" />
              Publicado
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[980px] grid-cols-7">
            {week.map((day) => {
              const events = scheduledPosts.filter((post) =>
                post.scheduledAt?.startsWith(day.date),
              );
              const isWeekend = Number(day.day) >= 24;

              return (
                <div
                  key={day.date}
                  className={
                    isWeekend
                      ? "border-b border-r border-ds-line bg-ds-surface-hover/40 last:border-r-0"
                      : "border-b border-r border-ds-line last:border-r-0"
                  }
                >
                  <div className="flex items-center justify-between border-b border-ds-line px-3 py-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle">
                      {day.weekday}
                    </span>
                    <span
                      className={
                        day.today
                          ? "flex size-6 items-center justify-center rounded-full bg-ds-brand text-xs font-semibold text-ds-on-brand"
                          : "text-sm font-semibold text-ds-text"
                      }
                    >
                      {day.day}
                    </span>
                  </div>

                  <div className="flex min-h-[260px] flex-col gap-2 p-2">
                    {isWeekend ? (
                      <p className="pt-6 text-center text-[11px] leading-4 text-ds-text-subtle">
                        Fora da rotina
                        <br />
                        de publicação
                      </p>
                    ) : (
                      <>
                        <div className="rounded-ds border border-dashed border-ds-line px-2 py-1.5">
                          <p className="text-[11px] font-semibold text-ds-text-subtle">
                            {scheduleConfig.publishTime} · Rotina
                          </p>
                          <p className="mt-0.5 text-[11px] leading-4 text-ds-text-subtle">
                            {queue.length} posts na fila
                          </p>
                        </div>

                        {events.map((post) => (
                          <div
                            key={post.id}
                            className="rounded-ds border border-ds-line bg-ds-info-bg px-2 py-1.5 shadow-ds-raised"
                          >
                            <p className="text-[11px] font-semibold text-ds-info-text">
                              {formatTime(post.scheduledAt!)} · Fixo
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-4 text-ds-text">
                              {post.title}
                            </p>
                            <div className="mt-1.5 flex items-center justify-between gap-1">
                              <ScorePill score={effectiveScore(post)} />
                              <Tag>{post.tags[0]}</Tag>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <CardFooter>
          <p className="text-xs text-ds-text-subtle">
            Horários em America/Sao_Paulo. Posts fixos são verificados a cada 5
            minutos.
          </p>
          <Badge tone={scheduleConfig.paused ? "warning" : "success"}>
            {scheduleConfig.paused ? "Automação pausada" : "Automação ativa"}
          </Badge>
        </CardFooter>
      </Card>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Agendamentos fixos"
            description="Posts que ignoram a ordem da fila e saem no horário definido."
            action={
              <ButtonLink href="/posts" variant="subtle" size="sm">
                Ver todos
                <ArrowUpRightIcon className="size-3.5" />
              </ButtonLink>
            }
          />
          <ul className="divide-y divide-ds-line">
            {scheduledPosts.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-ds bg-ds-info-bg text-ds-info-text">
                  <span className="text-sm font-semibold leading-4">
                    {formatDay(post.scheduledAt!)}
                  </span>
                  <span className="text-[10px] uppercase leading-3">
                    {formatMonthShort(post.scheduledAt!)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ds-text">
                    {post.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ds-text-subtle">
                    {formatTime(post.scheduledAt!)} ·{" "}
                    {formatWeekday(post.scheduledAt!).replace(".", "")} ·
                    horário fixo
                  </p>
                </div>
                <ScorePill score={effectiveScore(post)} />
                <StatusBadge status={post.status} />
                <Button variant="subtle" size="sm">
                  Reagendar
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Rotina de publicação"
            description="Definida em Configurações."
            action={<Badge tone="success">Ativa</Badge>}
          />
          <CardBody>
            <p className="text-2xl font-semibold leading-8 text-ds-text">
              {scheduleConfig.publishTime}
            </p>
            <p className="mt-0.5 text-sm text-ds-text-subtle">
              {scheduleConfig.timezone}
            </p>

            <div className="mt-3 flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const enabled = scheduleConfig.publishWeekdays.includes(day);
                return (
                  <span
                    key={day}
                    className={
                      enabled
                        ? "inline-flex size-8 items-center justify-center rounded-ds bg-ds-info-bg text-xs font-semibold text-ds-info-text"
                        : "inline-flex size-8 items-center justify-center rounded-ds bg-ds-surface-hover text-xs font-medium text-ds-text-subtle"
                    }
                  >
                    {weekdayLabels[day]}
                  </span>
                );
              })}
            </div>

            <dl className="mt-4 divide-y divide-ds-line text-sm">
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-ds-text-subtle">Próximo ciclo</dt>
                <dd className="font-medium text-ds-text">Ter, 20 out · 09:00</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-ds-text-subtle">Alerta de fila</dt>
                <dd className="font-medium text-ds-text">
                  &lt; {scheduleConfig.minQueueAlert} posts
                </dd>
              </div>
            </dl>
          </CardBody>
          <CardFooter>
            <ButtonLink href="/configuracoes" variant="subtle" size="sm">
              Editar rotina
              <ArrowUpRightIcon className="size-3.5" />
            </ButtonLink>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
