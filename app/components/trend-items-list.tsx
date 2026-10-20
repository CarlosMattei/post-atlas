"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Card,
  EmptyState,
  ScorePill,
  StatCard,
  inputClassName,
  selectClassName,
} from "./ui";
import { SearchIcon, SparklesIcon, TrendingUpIcon } from "./icons";
import type { TrendItem, TrendStatus } from "@/app/lib/types";

function isTrendStatus(value: string): value is TrendStatus {
  return value === "novo" || value === "usado" || value === "descartado";
}

const statusLabels: Record<TrendStatus, string> = {
  novo: "Novo",
  usado: "Usado",
  descartado: "Descartado",
};

const statusTones: Record<TrendStatus, "discovery" | "info" | "neutral"> = {
  novo: "discovery",
  usado: "info",
  descartado: "neutral",
};

function formatCollectedDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function TrendItemsList({ items }: { items: TrendItem[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TrendStatus | "todos">("todos");
  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return items.filter((item) => {
      const matchesStatus = status === "todos" || item.status === status;
      const matchesSearch =
        !term ||
        `${item.title} ${item.source} ${item.sources.join(" ")}`
          .toLocaleLowerCase("pt-BR")
          .includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [items, search, status]);

  const statusCounts = {
    novo: items.filter((item) => item.status === "novo").length,
    usado: items.filter((item) => item.status === "usado").length,
    descartado: items.filter((item) => item.status === "descartado").length,
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total coletado"
          value={String(items.length)}
          hint="Todos os temas disponíveis"
          icon={TrendingUpIcon}
        />
        <StatCard
          label="Novos"
          value={String(statusCounts.novo)}
          hint="Prontos para avaliar"
          icon={SparklesIcon}
        />
        <StatCard
          label="Usados"
          value={String(statusCounts.usado)}
          hint="Já viraram conteúdo"
        />
        <StatCard
          label="Descartados"
          value={String(statusCounts.descartado)}
          hint="Fora da pauta"
        />
      </div>

      <Card className="mt-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-ds-line px-4 py-2.5">
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Buscar tendências</span>
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-subtle" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar tema ou fonte"
              className={`${inputClassName} pl-8`}
            />
          </label>
          <label className="w-full sm:w-40">
            <span className="sr-only">Filtrar por status</span>
            <select
              value={status}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "todos" || isTrendStatus(value)) {
                  setStatus(value);
                }
              }}
              className={selectClassName}
            >
              <option value="todos">Todos os status</option>
              <option value="novo">Novos</option>
              <option value="usado">Usados</option>
              <option value="descartado">Descartados</option>
            </select>
          </label>
          <span
            className="ml-auto text-xs text-ds-text-subtle"
            aria-live="polite"
          >
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "tema" : "temas"}
          </span>
        </div>

        {filteredItems.length ? (
          <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <li
                key={item.id}
                className="min-w-0"
              >
                <Link
                  href={`/tendencias/${item.id}`}
                  aria-label={`Ver detalhes da tendência: ${item.title}`}
                  className="flex h-full min-w-0 flex-col rounded-ds-lg border border-ds-line bg-ds-surface p-4 no-underline outline-none transition-colors hover:border-ds-focus/40 hover:bg-ds-surface-hover/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Badge tone={statusTones[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                    <ScorePill score={item.score} />
                  </div>
                  <h2 className="mt-3 text-sm font-semibold leading-5 text-ds-text">
                    {item.title}
                  </h2>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-xs text-ds-text-subtle">
                    <span className="truncate">
                      {item.sources.join(" · ") || item.source}
                    </span>
                    <time dateTime={item.collectedOn}>
                      {formatCollectedDate(item.collectedOn)}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={SearchIcon}
            title={
              items.length
                ? "Nenhuma tendência encontrada"
                : "Ainda não há tendências"
            }
            description={
              items.length
                ? "Tente alterar a busca ou o filtro de status."
                : "Os temas coletados aparecerão aqui assim que forem registrados."
            }
          />
        )}
      </Card>
    </>
  );
}
