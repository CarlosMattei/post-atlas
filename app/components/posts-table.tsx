import Link from "next/link";
import { effectiveScore, formatDateTime } from "@/app/lib/format";
import type { Post } from "@/app/lib/types";
import { Button } from "./button";
import { MoreHorizontalIcon, RotateCcwIcon } from "./icons";
import { ScorePill, StatusBadge, Tag } from "./ui";

function formatPostDate(post: Post): string {
  if (post.scheduledAt) return formatDateTime(post.scheduledAt);
  if (post.publishedAt) return formatDateTime(post.publishedAt);
  return "—";
}

export function PostsTable({
  posts,
  variant = "default",
}: {
  posts: Post[];
  variant?: "default" | "archived";
}) {
  const archived = variant === "archived";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[840px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-ds-line bg-ds-surface-hover/50">
            <th
              scope="col"
              className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle"
            >
              Post
            </th>
            {archived ? null : (
              <th
                scope="col"
                className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle"
              >
                Status
              </th>
            )}
            <th
              scope="col"
              className="w-20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle"
            >
              Score
            </th>
            <th
              scope="col"
              className="w-44 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle"
            >
              {archived ? "Arquivado em" : "Publicação"}
            </th>
            <th
              scope="col"
              className="w-40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle"
            >
              {archived ? "Criado em" : "Atualizado"}
            </th>
            <th scope="col" className="w-16 px-4 py-2">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ds-line">
          {posts.map((post) => (
            <tr
              key={post.id}
              className="align-top transition-colors hover:bg-ds-surface-hover/60"
            >
              <td className="min-w-0 px-4 py-3">
                <Link
                  href={`/posts/${post.id}`}
                  aria-label={`Abrir detalhes de ${post.title}`}
                  className="font-medium leading-5 text-ds-text underline-offset-2 outline-none transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                >
                  {post.title}
                </Link>
                <p className="mt-0.5 line-clamp-1 text-xs leading-4 text-ds-text-subtle">
                  {post.body}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                  {post.tags.length > 3 ? (
                    <Tag>+{post.tags.length - 3}</Tag>
                  ) : null}
                </div>
              </td>

              {archived ? null : (
                <td className="px-4 py-3">
                  <StatusBadge status={post.status} />
                  {post.status === "erro" && post.attempts > 0 ? (
                    <p className="mt-1 text-[11px] leading-4 text-ds-text-subtle">
                      {post.attempts} tentativas
                    </p>
                  ) : null}
                </td>
              )}

              <td className="px-4 py-3">
                <ScorePill score={effectiveScore(post)} />
              </td>

              <td className="px-4 py-3 text-xs leading-5 text-ds-text">
                {archived
                  ? formatDateTime(post.updatedAt)
                  : formatPostDate(post)}
              </td>

              <td className="px-4 py-3 text-xs leading-5 text-ds-text-subtle">
                {archived
                  ? formatDateTime(post.createdAt)
                  : formatDateTime(post.updatedAt)}
              </td>

              <td className="px-4 py-3 text-right">
                {archived ? (
                  <Button
                    variant="subtle"
                    size="sm"
                    aria-label={`Restaurar ${post.title}`}
                  >
                    <RotateCcwIcon className="size-4" />
                    Restaurar
                  </Button>
                ) : (
                  <Button
                    variant="subtle"
                    size="icon-sm"
                    aria-label={`Ações de ${post.title}`}
                  >
                    <MoreHorizontalIcon className="size-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
