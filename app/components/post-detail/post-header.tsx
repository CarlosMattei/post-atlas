"use client";

import {
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Separator,
} from "react-aria-components/Menu";
import { formatDateTime } from "@/app/lib/format";
import { canReject } from "@/app/lib/post-form";
import { Button, ButtonLink } from "../button";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  MoreHorizontalIcon,
  PlayIcon,
  RotateCcwIcon,
  TrashIcon,
  XCircleIcon,
  XIcon,
} from "../icons";
import { StatusBadge } from "../ui";
import type { PostFormController } from "./use-post-form";

const menuItemClassName =
  "flex cursor-pointer items-center gap-2 rounded-ds px-2 py-1.5 text-sm text-ds-text outline-none data-[focused]:bg-ds-surface-hover data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50";

export function PostHeader({
  form,
  onRequestDiscard,
  onRequestDelete,
}: {
  form: PostFormController;
  onRequestDiscard: () => void;
  onRequestDelete: () => void;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 pb-5">
      <div className="min-w-0">
        <ButtonLink
          href="/posts"
          variant="subtle"
          size="sm"
          className="-ml-2 text-ds-text-subtle"
        >
          <ArrowLeftIcon className="size-4" />
          Posts
        </ButtonLink>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="min-w-0 break-words text-2xl font-semibold leading-8 tracking-tight text-ds-text">
            {form.title.trim() || "Post sem título"}
          </h1>
          <StatusBadge status={form.status} />
        </div>

        <p className="mt-1 text-xs leading-4 text-ds-text-subtle">
          Criado em {formatDateTime(form.post.createdAt)} · Atualizado em{" "}
          {formatDateTime(form.updatedAt)}
        </p>
      </div>

      <MenuTrigger>
        <Button variant="outline" size="icon" aria-label="Mais ações do post">
          <MoreHorizontalIcon className="size-4" />
        </Button>
        <Popover
          placement="bottom end"
          className="z-50 min-w-56 rounded-ds-lg border border-ds-line bg-ds-surface p-1 shadow-ds-overlay outline-none"
        >
          <Menu
            aria-label="Ações do post"
            className="outline-none"
            onAction={(key) => {
              const action = String(key);

              if (action === "archive") form.archive();
              if (action === "reject") form.reject();
              if (action === "run") form.runNow();
              if (action === "discard") onRequestDiscard();
              if (action === "delete") onRequestDelete();
            }}
          >
            <MenuItem
              id="archive"
              textValue={
                form.status === "arquivado"
                  ? "Restaurar post"
                  : "Arquivar post"
              }
              isDisabled={form.status === "publicando"}
              className={menuItemClassName}
            >
              {form.status === "arquivado" ? (
                <RotateCcwIcon className="size-4" />
              ) : (
                <ArchiveIcon className="size-4" />
              )}
              {form.status === "arquivado"
                ? "Restaurar post"
                : "Arquivar post"}
            </MenuItem>

            <MenuItem
              id="reject"
              textValue="Reprovar post"
              isDisabled={!canReject(form.status)}
              className={menuItemClassName}
            >
              <XCircleIcon className="size-4" />
              Reprovar post
            </MenuItem>

            <MenuItem
              id="run"
              textValue="Executar agora"
              isDisabled={form.status === "publicando"}
              className={menuItemClassName}
            >
              <PlayIcon className="size-4" />
              Executar agora
            </MenuItem>

            <Separator className="my-1 h-px bg-ds-line" />

            <MenuItem
              id="discard"
              textValue="Descartar alterações"
              isDisabled={!form.isDirty}
              className={menuItemClassName}
            >
              <XIcon className="size-4" />
              Descartar alterações
            </MenuItem>

            <Separator className="my-1 h-px bg-ds-line" />

            <MenuItem
              id="delete"
              textValue="Excluir post"
              className={`${menuItemClassName} text-ds-danger-text data-[focused]:bg-ds-danger-bg`}
            >
              <TrashIcon className="size-4" />
              Excluir post
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
    </header>
  );
}
