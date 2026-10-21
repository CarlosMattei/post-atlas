"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Separator,
} from "react-aria-components/Menu";
import {
  approvePost,
  archivePost,
  deletePost,
  restorePost,
} from "@/app/lib/post-actions";
import type { Post, PostStatus } from "@/app/lib/types";
import { Button } from "./button";
import { ConfirmDialog } from "./confirm-dialog";
import {
  ArchiveIcon,
  CheckCircleIcon,
  EditIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  TrashIcon,
} from "./icons";

const menuItemClassName =
  "flex cursor-pointer items-center rounded-ds px-2 py-1.5 text-sm text-ds-text outline-none data-[focused]:bg-ds-surface-hover data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50";

const dangerMenuItemClassName = `${menuItemClassName} text-ds-danger-text data-[focused]:bg-ds-danger-bg`;

const approveableStatuses: PostStatus[] = ["rascunho", "reprovado", "erro"];
const lockedStatuses: PostStatus[] = ["publicado", "publicando"];

function MenuItemContent({
  icon,
  label,
  hint,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      <span className="flex flex-col">
        <span>{label}</span>
        {hint ? (
          <span className="text-[11px] leading-4 text-ds-text-subtle">{hint}</span>
        ) : null}
      </span>
    </span>
  );
}

export function PostRowActions({ post }: { post: Post }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isArchived = post.status === "arquivado";
  const isLocked = lockedStatuses.includes(post.status);
  const canApprove = approveableStatuses.includes(post.status);

  const approveHint = canApprove
    ? undefined
    : post.status === "aprovado" || post.status === "agendado"
      ? "O post já está aprovado."
      : isArchived
        ? "Restaure o post antes de aprová-lo."
        : "Posts publicados não podem ser aprovados.";

  const archiveHint = isLocked
    ? "Posts publicados são imutáveis e não saem da fila."
    : undefined;

  function execute(action: () => Promise<void>) {
    setError(null);
    setIsPending(true);

    action()
      .then(() => {
        router.refresh();
      })
      .catch((caught: unknown) => {
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível concluir a ação.",
        );
      })
      .finally(() => {
        setIsPending(false);
      });
  }

  function handleAction(action: string) {
    if (action === "edit") {
      router.push(`/posts/${post.id}`);
      return;
    }
    if (action === "approve") {
      execute(() => approvePost(post.id));
      return;
    }
    if (action === "archive") {
      execute(() => archivePost(post.id));
      return;
    }
    if (action === "restore") {
      execute(() => restorePost(post.id));
      return;
    }
    if (action === "delete") {
      setIsConfirmingDelete(true);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <MenuTrigger>
        <Button
          variant="subtle"
          size="icon-sm"
          aria-label={`Ações de ${post.title}`}
          isPending={isPending}
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
        <Popover
          placement="bottom end"
          className="z-50 min-w-56 rounded-ds-lg border border-ds-line bg-ds-surface p-1 shadow-ds-overlay outline-none"
        >
          <Menu
            aria-label="Ações do post"
            className="outline-none"
            onAction={(key) => handleAction(String(key))}
          >
            <MenuItem
              id="edit"
              textValue="Editar post"
              className={menuItemClassName}
            >
              <MenuItemContent icon={<EditIcon className="size-4" />} label="Editar post" />
            </MenuItem>

            {isArchived ? null : (
              <MenuItem
                id="approve"
                textValue="Aprovar post"
                isDisabled={!canApprove}
                className={menuItemClassName}
              >
                <MenuItemContent
                  icon={<CheckCircleIcon className="size-4" />}
                  label="Aprovar post"
                  hint={approveHint}
                />
              </MenuItem>
            )}

            {isArchived ? (
              <MenuItem
                id="restore"
                textValue="Restaurar post"
                className={menuItemClassName}
              >
                <MenuItemContent
                  icon={<RotateCcwIcon className="size-4" />}
                  label="Restaurar post"
                />
              </MenuItem>
            ) : (
              <MenuItem
                id="archive"
                textValue="Arquivar post"
                isDisabled={isLocked}
                className={menuItemClassName}
              >
                <MenuItemContent
                  icon={<ArchiveIcon className="size-4" />}
                  label="Arquivar post"
                  hint={archiveHint}
                />
              </MenuItem>
            )}

            <Separator className="my-1 h-px bg-ds-line" />

            <MenuItem
              id="delete"
              textValue="Excluir post"
              className={dangerMenuItemClassName}
            >
              <MenuItemContent
                icon={<TrashIcon className="size-4" />}
                label="Excluir post"
              />
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>

      {error ? (
        <p
          role="alert"
          className="max-w-[14rem] text-right text-[11px] leading-4 text-ds-danger-text"
        >
          {error}
        </p>
      ) : null}

      {isConfirmingDelete ? (
        <ConfirmDialog
          open
          title="Excluir post"
          description={`“${post.title}” será removido do Post Atlas. Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={() => {
            setIsConfirmingDelete(false);
            execute(() => deletePost(post.id));
          }}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      ) : null}
    </div>
  );
}
