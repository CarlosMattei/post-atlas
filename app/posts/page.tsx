import type { Metadata } from "next";
import { Button, ButtonLink } from "@/app/components/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
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
import { getPosts } from "@/app/lib/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Posts · Post Atlas",
};

export default async function PostsPage() {
  const posts = await getPosts();
  const orderedPosts = [...posts].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Posts"
        description="Crie, avalie, agende e acompanhe todos os conteúdos antes da publicação no LinkedIn."
        actions={
          <>
            <Button variant="outline">
              <SparklesIcon className="size-4" />
              Reavaliar scores
            </Button>
            <ButtonLink href="/posts/novo" variant="primary">
              <PlusIcon className="size-4" />
              Novo post
            </ButtonLink>
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-ds-line px-4 py-2.5">
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Buscar posts</span>
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-subtle" />
            <input
              type="search"
              placeholder="Buscar por título ou tag"
              className={`${inputClassName} pl-8`}
            />
          </label>

          <label className="w-full sm:w-40">
            <span className="sr-only">Filtrar por status</span>
            <select className={selectClassName} defaultValue="todos">
              <option value="todos">Todos os status</option>
              <option value="rascunho">Rascunho</option>
              <option value="aprovado">Aprovado</option>
              <option value="reprovado">Reprovado</option>
              <option value="agendado">Agendado</option>
              <option value="publicando">Publicando</option>
              <option value="publicado">Publicado</option>
              <option value="erro">Erro</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </label>

          <label className="w-full sm:w-40">
            <span className="sr-only">Filtrar por tag</span>
            <select className={selectClassName} defaultValue="todas">
              <option value="todas">Todas as tags</option>
              <option value="n8n">n8n</option>
              <option value="automação">Automação</option>
              <option value="linkedin">LinkedIn</option>
              <option value="produtividade">Produtividade</option>
              <option value="ia">IA</option>
            </select>
          </label>

          <Button variant="subtle" size="sm">
            <FilterIcon className="size-4" />
            Filtros
          </Button>

          <span className="ml-auto text-xs text-ds-text-subtle">
            {posts.length} posts
          </span>
        </div>

        <PostsTable posts={orderedPosts} />

        <CardFooter>
          <p className="text-xs text-ds-text-subtle">
            A fila considera ordem manual, score efetivo e data de criação.
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
