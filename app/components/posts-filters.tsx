"use client";

import { useMemo, useState } from "react";
import { FiltersDialog, defaultFilters, type PostFilters } from "./filters-dialog";
import { PostsTable } from "./posts-table";
import { SearchIcon } from "./icons";
import { inputClassName, selectClassName } from "./ui";
import { effectiveScore } from "@/app/lib/format";
import type { Post } from "@/app/lib/types";

const statusOptions = [
  { value: "todos", label: "Todos os status" },
  { value: "rascunho", label: "Rascunho" },
  { value: "aprovado", label: "Aprovado" },
  { value: "reprovado", label: "Reprovado" },
  { value: "agendado", label: "Agendado" },
  { value: "publicando", label: "Publicando" },
  { value: "publicado", label: "Publicado" },
  { value: "erro", label: "Erro" },
  { value: "arquivado", label: "Arquivado" },
];

const tagOptions = [
  { value: "todas", label: "Todas as tags" },
  { value: "n8n", label: "n8n" },
  { value: "automação", label: "Automação" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "produtividade", label: "Produtividade" },
  { value: "ia", label: "IA" },
];

export function PostsFilters({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [tag, setTag] = useState("todas");
  const [filters, setFilters] = useState<PostFilters>(defaultFilters);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = posts.filter((post) => {
      if (status !== "todos" && post.status !== status) return false;
      if (tag !== "todas" && !post.tags.includes(tag)) return false;

      if (filters.statuses.length > 0 && !filters.statuses.includes(post.status)) {
        return false;
      }
      if (
        filters.tags.length > 0 &&
        !post.tags.some((postTag) => filters.tags.includes(postTag))
      ) {
        return false;
      }
      if (filters.onlyWithImages && !(post.images?.length ?? 0)) return false;

      if (query) {
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesTag = post.tags.some((postTag) =>
          postTag.toLowerCase().includes(query),
        );
        if (!matchesTitle && !matchesTag) return false;
      }

      return true;
    });

    return [...result].sort((a, b) => {
      switch (filters.order) {
        case "antigos":
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        case "score":
          return effectiveScore(b) - effectiveScore(a);
        case "titulo":
          return a.title.localeCompare(b.title, "pt-BR");
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });
  }, [posts, search, status, tag, filters]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-ds-line px-4 py-2.5">
        <label className="relative block w-full sm:w-64">
          <span className="sr-only">Buscar posts</span>
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-subtle" />
          <input
            type="search"
            placeholder="Buscar por título ou tag"
            className={`${inputClassName} pl-8`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label className="w-full sm:w-40">
          <span className="sr-only">Filtrar por status</span>
          <select
            className={selectClassName}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="w-full sm:w-40">
          <span className="sr-only">Filtrar por tag</span>
          <select
            className={selectClassName}
            value={tag}
            onChange={(event) => setTag(event.target.value)}
          >
            {tagOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <FiltersDialog filters={filters} onChange={setFilters} />
        </div>

        <span className="ml-auto text-xs text-ds-text-subtle">
          {filteredPosts.length} posts
        </span>
      </div>

      <PostsTable posts={filteredPosts} />
    </>
  );
}
