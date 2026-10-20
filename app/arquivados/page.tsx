import type { Metadata } from "next";
import { Button, ButtonLink } from "@/app/components/button";
import {
  ArchiveIcon,
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  SearchIcon,
} from "@/app/components/icons";
import { PostsTable } from "@/app/components/posts-table";
import {
  Card,
  CardFooter,
  PageContainer,
  PageHeader,
  inputClassName,
  selectClassName,
} from "@/app/components/ui";
import { posts } from "@/app/lib/data";
import { formatDateTime } from "@/app/lib/format";

export const metadata: Metadata = {
  title: "Arquivados · Post Atlas",
};

export default function ArchivedPage() {
  const archivedPosts = posts
    .filter((post) => post.status === "arquivado")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  return (
    <PageContainer>
      <PageHeader
        title="Arquivados"
        description="Conteúdos fora de circulação que ainda podem voltar como rascunho."
        actions={
          <>
            <Button variant="outline">
              <DownloadIcon className="size-4" />
              Exportar
            </Button>
            <ButtonLink href="/posts" variant="primary">
              Voltar para posts
            </ButtonLink>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-ds-lg border border-ds-line bg-ds-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-ds bg-ds-surface-hover text-ds-text-subtle">
            <ArchiveIcon className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ds-text">
              {archivedPosts.length} posts arquivados
            </p>
            <p className="text-xs text-ds-text-subtle">
              Último arquivamento em{" "}
              {archivedPosts[0]
                ? formatDateTime(archivedPosts[0].updatedAt)
                : "—"}
            </p>
          </div>
        </div>
        <ButtonLink href="/posts" variant="subtle" size="sm">
          Ver posts ativos
          <ArrowUpRightIcon className="size-3.5" />
        </ButtonLink>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-ds-line px-4 py-2.5">
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Buscar posts arquivados</span>
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-subtle" />
            <input
              type="search"
              placeholder="Buscar por título ou tag"
              className={`${inputClassName} pl-8`}
            />
          </label>

          <label className="w-full sm:w-52">
            <span className="sr-only">Ordenar arquivados</span>
            <select className={selectClassName} defaultValue="recentes">
              <option value="recentes">Arquivados recentemente</option>
              <option value="antigos">Mais antigos primeiro</option>
              <option value="score">Maior score</option>
            </select>
          </label>

          <span className="ml-auto text-xs text-ds-text-subtle">
            Restauração disponível
          </span>
        </div>

        <PostsTable posts={archivedPosts} variant="archived" />

        <CardFooter>
          <p className="text-xs text-ds-text-subtle">
            Posts publicados são imutáveis. O arquivamento vale até a
            publicação.
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="subtle"
              size="icon-sm"
              aria-label="Página anterior"
              isDisabled
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="px-2 text-xs font-medium text-ds-text">1 de 1</span>
            <Button
              variant="subtle"
              size="icon-sm"
              aria-label="Próxima página"
              isDisabled
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </PageContainer>
  );
}
