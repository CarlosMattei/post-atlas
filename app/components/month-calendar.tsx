"use client";

import { useMemo, useState } from "react";
import { cx } from "@/app/lib/cx";
import { movePostInCalendar } from "@/app/lib/post-actions";
import { statusLabels } from "@/app/lib/format";
import type { Post, PostStatus, ScheduleConfig } from "@/app/lib/types";
import { Button } from "./button";
import {
  ArchiveIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "./icons";
import { Card, CardFooter } from "./ui";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

type CalendarEntry = {
  id: string;
  date: string | null;
  time: string;
  status: PostStatus;
};

const statusTones: Record<
  PostStatus,
  { card: string; meta: string; dot: string }
> = {
  rascunho: {
    card: "border-ds-line bg-ds-surface-hover",
    meta: "text-ds-text-subtle",
    dot: "bg-ds-text-subtle",
  },
  aprovado: {
    card: "border-ds-info-text/20 bg-ds-info-bg",
    meta: "text-ds-info-text",
    dot: "bg-ds-info-text",
  },
  reprovado: {
    card: "border-ds-danger-text/25 bg-ds-danger-bg",
    meta: "text-ds-danger-text",
    dot: "bg-ds-danger-text",
  },
  agendado: {
    card: "border-ds-discovery-text/25 bg-ds-discovery-bg",
    meta: "text-ds-discovery-text",
    dot: "bg-ds-discovery-text",
  },
  publicando: {
    card: "border-ds-warning-text/25 bg-ds-warning-bg",
    meta: "text-ds-warning-text",
    dot: "bg-ds-warning-text",
  },
  publicado: {
    card: "border-ds-success-text/25 bg-ds-success-bg",
    meta: "text-ds-success-text",
    dot: "bg-ds-success-text",
  },
  erro: {
    card: "border-ds-danger-text/25 bg-ds-danger-bg",
    meta: "text-ds-danger-text",
    dot: "bg-ds-danger-text",
  },
  arquivado: {
    card: "border-ds-line bg-ds-neutral-bg",
    meta: "text-ds-neutral-text",
    dot: "bg-ds-neutral-text",
  },
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function dateKeyFromIso(iso: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

function timeFromIso(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  }).format(new Date(iso));
}

function monthDate(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1));
}

function buildMonthCells(year: number, month: number) {
  const firstWeekday = (monthDate(year, month).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<{ day: number; key: string } | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, key: `${year}-${pad(month + 1)}-${pad(day)}` });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function longDay(dayKey: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${dayKey}T12:00:00Z`));
}

function weekDayAndDay(dayKey: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${dayKey}T12:00:00Z`));
}

function canMove(entry: CalendarEntry): boolean {
  return entry.status !== "publicado" && entry.status !== "publicando";
}

function initialEntries(
  posts: Post[],
  publishTime: string,
  timezone: string,
): Record<string, CalendarEntry> {
  const entries: Record<string, CalendarEntry> = {};

  for (const post of posts) {
    const iso = post.scheduledAt ?? post.publishedAt;

    entries[post.id] = {
      id: post.id,
      status: post.status,
      date: iso ? dateKeyFromIso(iso, timezone) : null,
      time: iso ? timeFromIso(iso, timezone) : publishTime,
    };
  }

  return entries;
}

function CalendarPostCard({
  post,
  entry,
  selected,
  dragging,
  movable,
  onSelect,
  onDragStart,
  onDragEnd,
}: {
  post: Post;
  entry: CalendarEntry;
  selected: boolean;
  dragging: boolean;
  movable: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const tone = statusTones[entry.status];

  return (
    <button
      type="button"
      draggable={movable}
      aria-pressed={selected}
      aria-disabled={!movable}
      title={
        movable
          ? "Arraste para outro dia ou selecione para mover"
          : "Posts publicados não podem ser reagendados"
      }
      onClick={movable ? onSelect : undefined}
      onDragStart={
        movable
          ? (event) => {
              event.dataTransfer.setData("text/plain", post.id);
              event.dataTransfer.effectAllowed = "move";
              onDragStart();
            }
          : undefined
      }
      onDragEnd={movable ? onDragEnd : undefined}
      className={cx(
        "group w-full rounded-ds border px-2 py-1.5 text-left outline-none transition-[box-shadow,opacity]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus",
        tone.card,
        movable ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        dragging && "opacity-40",
        selected && "ring-2 ring-ds-brand ring-offset-1 ring-offset-ds-surface",
      )}
    >
      <span
        className={cx(
          "flex items-center gap-1 text-[10px] font-bold uppercase leading-3 tracking-[0.03em]",
          tone.meta,
        )}
      >
        {entry.date ? entry.time : statusLabels[entry.status]}
        {entry.status === "publicado" ? (
          <CheckIcon className="size-3" />
        ) : null}
      </span>
      <span className="mt-0.5 line-clamp-2 block text-[11px] font-medium leading-4 text-ds-text">
        {post.title}
      </span>
    </button>
  );
}

function LegendItem({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={cx("size-2 rounded-full", dot)} />
      {label}
    </span>
  );
}

export function MonthCalendar({
  posts,
  scheduleConfig,
}: {
  posts: Post[];
  scheduleConfig: ScheduleConfig;
}) {
  const today = dateKeyFromIso(
    new Date().toISOString(),
    scheduleConfig.timezone,
  );
  const todayDate = new Date(`${today}T12:00:00Z`);
  const postById = new Map(posts.map((post) => [post.id, post]));
  const [view, setView] = useState({
    year: todayDate.getUTCFullYear(),
    month: todayDate.getUTCMonth(),
  });
  const [entries, setEntries] = useState<Record<string, CalendarEntry>>(
    () =>
      initialEntries(
        posts,
        scheduleConfig.publishTime,
        scheduleConfig.timezone,
      ),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropDate, setDropDate] = useState<string | null>(null);
  const [backlogOver, setBacklogOver] = useState(false);
  const [notice, setNotice] = useState("");

  const monthName = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        timeZone: "UTC",
      }).format(monthDate(view.year, view.month)),
    [view],
  );

  const heading = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} de ${view.year}`;
  const monthKey = `${view.year}-${pad(view.month + 1)}`;
  const cells = useMemo(
    () => buildMonthCells(view.year, view.month),
    [view],
  );
  const monthEntries = useMemo(
    () =>
      Object.values(entries).filter((entry) =>
        entry.date?.startsWith(monthKey),
      ),
    [entries, monthKey],
  );
  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();

    for (const entry of Object.values(entries)) {
      if (!entry.date) continue;
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }

    for (const list of map.values()) {
      list.sort((a, b) => a.time.localeCompare(b.time));
    }

    return map;
  }, [entries]);
  const backlog = useMemo(
    () =>
      Object.values(entries).filter(
        (entry) => !entry.date && entry.status !== "arquivado",
      ),
    [entries],
  );

  const selectedEntry = selectedId ? entries[selectedId] : null;
  const selectedPost = selectedId ? postById.get(selectedId) : null;

  const daysInMonth = new Date(
    Date.UTC(view.year, view.month + 1, 0),
  ).getUTCDate();

  function shiftMonth(delta: number) {
    setView((current) => {
      const next = new Date(
        Date.UTC(current.year, current.month + delta, 1),
      );
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
    setSelectedId(null);
  }

  function goToToday() {
    setView({
      year: todayDate.getUTCFullYear(),
      month: todayDate.getUTCMonth(),
    });
    setSelectedId(null);
  }

  async function moveToDay(id: string, date: string) {
    const entry = entries[id];

    if (!entry || !canMove(entry)) return;

    const post = postById.get(id);
    const fromBacklog = entry.date === null;

    try {
      await movePostInCalendar(id, date, entry.time, scheduleConfig.timezone);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível reagendar o post.",
      );
      return;
    }

    setEntries((current) => ({
      ...current,
      [id]: { ...current[id], date, status: "agendado" },
    }));
    setSelectedId(null);
    setDropDate(null);
    setDraggingId(null);
    setBacklogOver(false);
    setNotice(
      fromBacklog
        ? `"${post?.title}" agendado para ${longDay(date)} às ${entry.time}.`
        : `"${post?.title}" movido para ${longDay(date)}.`,
    );
  }

  async function returnToBacklog(id: string) {
    const entry = entries[id];

    if (!entry || !canMove(entry)) return;

    const post = postById.get(id);
    if (!post) return;

    try {
      await movePostInCalendar(id, null, entry.time, scheduleConfig.timezone);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível remover a data.",
      );
      return;
    }

    setEntries((current) => ({
      ...current,
      [id]: { ...current[id], date: null, status: "aprovado" },
    }));
    setSelectedId(null);
    setBacklogOver(false);
    setDraggingId(null);
    setNotice(`"${post?.title}" voltou para a fila sem data.`);
  }

  function endDrag() {
    setDraggingId(null);
    setDropDate(null);
    setBacklogOver(false);
  }

  return (
    <Card className="flex flex-col overflow-hidden lg:h-[calc(100vh-11rem)] lg:min-h-[560px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ds-line px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <Button
            variant="subtle"
            size="icon-sm"
            aria-label="Mês anterior"
            onPress={() => shiftMonth(-1)}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="subtle"
            size="icon-sm"
            aria-label="Próximo mês"
            onPress={() => shiftMonth(1)}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <div className="min-w-0 pl-1.5">
            <h2 className="truncate text-sm font-semibold leading-5 text-ds-text">
              {heading}
            </h2>
            <p className="truncate text-[11px] leading-4 text-ds-text-subtle">
              1 – {daysInMonth} de {monthName} · {monthEntries.length}{" "}
              {monthEntries.length === 1 ? "post" : "posts"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] leading-4 text-ds-text-subtle sm:inline">
            Arraste os cartões para reagendar
          </span>
          <Button variant="outline" size="sm" onPress={goToToday}>
            Hoje
          </Button>
        </div>
      </div>

      {selectedEntry && selectedPost ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ds-line bg-ds-surface-selected px-3 py-1.5">
          <p className="min-w-0 text-xs leading-5 text-ds-selected-text">
            <span className="font-semibold">{selectedPost.title}</span>{" "}
            selecionado — escolha um dia para mudar a data.
          </p>
          <Button
            variant="subtle"
            size="sm"
            onPress={() => setSelectedId(null)}
          >
            Cancelar
          </Button>
        </div>
      ) : null}

      <p role="status" aria-live="polite" className="sr-only">
        {notice}
      </p>

      <div className="flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 flex-col overflow-x-auto">
          <div className="grid min-w-[760px] grid-cols-7 border-b border-ds-line bg-ds-surface-hover/50">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid min-h-0 min-w-[760px] flex-1 auto-rows-fr grid-cols-7">
            {cells.map((cell, index) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${index}`}
                    aria-hidden="true"
                    className="border-b border-r border-ds-line bg-ds-app/70 [&:nth-child(7n)]:border-r-0"
                  />
                );
              }

              const dayEntries = byDate.get(cell.key) ?? [];
              const isToday = cell.key === today;
              const isWeekend = index % 7 >= 5;
              const isDropTarget = dropDate === cell.key;

              return (
                <div
                  key={cell.key}
                  onDragOver={(event) => {
                    if (draggingId) {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDropDate(cell.key);
                    }
                  }}
                  onDragLeave={(event) => {
                    const next = event.relatedTarget;

                    if (
                      !(next instanceof Node) ||
                      !event.currentTarget.contains(next)
                    ) {
                      setDropDate((current) =>
                        current === cell.key ? null : current,
                      );
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const id =
                      event.dataTransfer.getData("text/plain") || draggingId;

                    if (id) moveToDay(id, cell.key);
                  }}
                  className={cx(
                    "flex min-h-[88px] min-w-0 flex-col gap-1 border-b border-r border-ds-line p-1.5 transition-colors lg:min-h-0",
                    "[&:nth-child(7n)]:border-r-0",
                    isWeekend ? "bg-ds-surface-hover/30" : "bg-ds-surface",
                    isDropTarget &&
                      "bg-ds-surface-selected ring-2 ring-inset ring-ds-brand",
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={cx(
                        "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                        isToday
                          ? "bg-ds-brand text-ds-on-brand"
                          : "text-ds-text-subtle",
                      )}
                    >
                      {cell.day}
                    </span>
                    <span className="sr-only">{weekDayAndDay(cell.key)}</span>
                    {isToday ? (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.03em] text-ds-selected-text">
                        Hoje
                      </span>
                    ) : null}
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
                    {dayEntries.map((entry) => {
                      const post = postById.get(entry.id);

                      if (!post) return null;

                      return (
                        <CalendarPostCard
                          key={entry.id}
                          post={post}
                          entry={entry}
                          selected={selectedId === entry.id}
                          dragging={draggingId === entry.id}
                          movable={canMove(entry)}
                          onSelect={() =>
                            setSelectedId((current) =>
                              current === entry.id ? null : entry.id,
                            )
                          }
                          onDragStart={() => {
                            setDraggingId(entry.id);
                            setSelectedId(null);
                          }}
                          onDragEnd={endDrag}
                        />
                      );
                    })}
                  </div>

                  {selectedEntry ? (
                    <button
                      type="button"
                      onClick={() => moveToDay(selectedEntry.id, cell.key)}
                      className="mt-auto w-full rounded-ds border border-dashed border-ds-brand px-1 py-1 text-[10px] font-semibold leading-3 text-ds-selected-text outline-none transition-colors hover:bg-ds-surface-selected focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                    >
                      Mover para cá
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="hidden w-56 shrink-0 flex-col border-l border-ds-line xl:flex">
          <div className="flex items-center justify-between gap-2 border-b border-ds-line px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-5 text-ds-text">
                Sem data
              </p>
              <p className="text-[11px] leading-4 text-ds-text-subtle">
                {backlog.length}{" "}
                {backlog.length === 1 ? "post na fila" : "posts na fila"}
              </p>
            </div>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-ds bg-ds-surface-hover text-ds-text-subtle">
              <ArchiveIcon className="size-4" />
            </span>
          </div>

          <div
            onDragOver={(event) => {
              if (draggingId) {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setBacklogOver(true);
              }
            }}
            onDragLeave={(event) => {
              const next = event.relatedTarget;

              if (
                !(next instanceof Node) ||
                !event.currentTarget.contains(next)
              ) {
                setBacklogOver(false);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              const id =
                event.dataTransfer.getData("text/plain") || draggingId;

              if (id) returnToBacklog(id);
            }}
            className={cx(
              "flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2 transition-colors",
              backlogOver && "bg-ds-surface-selected",
            )}
          >
            {backlog.map((entry) => {
              const post = postById.get(entry.id);

              if (!post) return null;

              return (
                <CalendarPostCard
                  key={entry.id}
                  post={post}
                  entry={entry}
                  selected={selectedId === entry.id}
                  dragging={draggingId === entry.id}
                  movable={canMove(entry)}
                  onSelect={() =>
                    setSelectedId((current) =>
                      current === entry.id ? null : entry.id,
                    )
                  }
                  onDragStart={() => {
                    setDraggingId(entry.id);
                    setSelectedId(null);
                  }}
                  onDragEnd={endDrag}
                />
              );
            })}

            {backlog.length === 0 ? (
              <p className="px-1 py-4 text-center text-[11px] leading-4 text-ds-text-subtle">
                Todos os posts têm data.
              </p>
            ) : null}
          </div>

          <p className="border-t border-ds-line px-3 py-2 text-[11px] leading-4 text-ds-text-subtle">
            Arraste um cartão para um dia para agendar. Solte aqui para tirar a
            data.
          </p>
        </aside>
      </div>

      <CardFooter>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-ds-text-subtle">
          <LegendItem dot="bg-ds-discovery-text" label="Agendado" />
          <LegendItem dot="bg-ds-success-text" label="Publicado" />
          <LegendItem dot="bg-ds-text-subtle" label="Sem data" />
        </div>
        <p className="text-[11px] leading-4 text-ds-text-subtle">
          Rotina {scheduleConfig.publishTime} · seg a sex ·{" "}
          {scheduleConfig.timezone}
        </p>
      </CardFooter>
    </Card>
  );
}
