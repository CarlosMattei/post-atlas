import { formatDateTime } from "@/app/lib/format";
import type { Post } from "@/app/lib/types";
import { ChevronDownIcon } from "../icons";
import { DetailList } from "../ui";
import type { PostFormController } from "./use-post-form";

export function PostDetailsDisclosure({
  form,
  post,
}: {
  form: PostFormController;
  post: Post;
}) {
  return (
    <details className="group rounded-ds-lg border border-ds-line bg-ds-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-ds-text outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus [&::-webkit-details-marker]:hidden">
        Detalhes
        <ChevronDownIcon className="size-4 shrink-0 text-ds-text-subtle transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-ds-line px-4 py-3">
        <DetailList
          items={[
            {
              label: "Agendado para",
              value: form.scheduledAt
                ? formatDateTime(form.scheduledAt)
                : "Não agendado",
            },
            {
              label: "Publicado em",
              value: form.publishedAt
                ? formatDateTime(form.publishedAt)
                : "Não publicado",
            },
            { label: "Criado em", value: formatDateTime(post.createdAt) },
            { label: "Atualizado em", value: formatDateTime(form.updatedAt) },
            { label: "Tentativas", value: String(post.attempts) },
            { label: "ID no LinkedIn", value: form.linkedinPostId ?? "—" },
          ]}
        />
      </div>
    </details>
  );
}
