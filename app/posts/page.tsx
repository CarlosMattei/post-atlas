import type { Metadata } from "next";
import { Button, ButtonLink } from "@/app/components/button";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/app/components/icons";
import { PostsFilters } from "@/app/components/posts-filters";
import { ScoreEvaluateButton } from "@/app/components/score-evaluate-button";
import { Card, CardFooter, PageContainer, PageHeader } from "@/app/components/ui";
import { getPosts } from "@/app/lib/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Posts · Post Atlas",
};

const scorableStatuses = new Set(["rascunho", "aprovado"]);

export default async function PostsPage() {
  const posts = await getPosts();
  const orderedPosts = [...posts].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const pendingScores = orderedPosts.filter(
    (post) => post.aiScore === null && scorableStatuses.has(post.status),
  ).length;

  return (
    <PageContainer>
      <PageHeader
        title="Posts"
        description="Crie, avalie, agende e acompanhe todos os conteúdos antes da publicação no LinkedIn."
        actions={
          <>
            <ScoreEvaluateButton pending={pendingScores} />
            <ButtonLink href="/posts/novo" variant="primary">
              <PlusIcon className="size-4" />
              Novo post
            </ButtonLink>
          </>
        }
      />

      <Card>
        <PostsFilters posts={orderedPosts} />

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