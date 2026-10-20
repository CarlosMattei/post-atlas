import type { KeyboardEvent } from "react";
import {
  BODY_MAX,
  TAG_SUGGESTIONS,
  TITLE_MAX,
} from "@/app/lib/post-form";
import {
  Card,
  CardBody,
  CardHeader,
  inputClassName,
  labelClassName,
} from "../ui";
import { PlusIcon, TagIcon, XIcon } from "../icons";
import { MediaStrip } from "./media-strip";
import type { PostFormController } from "./use-post-form";

export function PostEditor({ form }: { form: PostFormController }) {
  const suggestedTags = TAG_SUGGESTIONS.filter(
    (suggestion) => !form.tags.includes(suggestion),
  ).slice(0, 6);

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    form.handleTagKeyDown(event);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Conteúdo"
          description="Título interno, texto do post e tags de organização."
        />
        <CardBody className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="post-title" className={labelClassName}>
                Título interno
              </label>
              <span className="text-[11px] tabular-nums text-ds-text-subtle">
                {form.title.length} / {TITLE_MAX}
              </span>
            </div>
            <input
              id="post-title"
              type="text"
              value={form.title}
              maxLength={TITLE_MAX}
              onChange={(event) => form.setTitle(event.target.value)}
              placeholder="Ex.: Como estruturei meu segundo cérebro no Obsidian"
              className={inputClassName}
            />
            <p className="mt-1 text-xs leading-4 text-ds-text-subtle">
              O título não aparece no LinkedIn; serve para organizar a fila.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="post-body" className={labelClassName}>
                Texto do post
              </label>
              <span className="text-[11px] tabular-nums text-ds-text-subtle">
                {form.body.length} / {BODY_MAX}
              </span>
            </div>
            <textarea
              id="post-body"
              rows={14}
              value={form.body}
              maxLength={BODY_MAX}
              onChange={(event) => form.setBody(event.target.value)}
              placeholder="Comece com o gancho das primeiras linhas. Depois desenvolva o argumento e feche com uma chamada para ação."
              className={`${inputClassName} h-auto min-h-64 resize-y py-2 leading-6`}
            />
            <p className="mt-1 text-xs leading-4 text-ds-text-subtle">
              A IA avalia clareza, gancho, valor para o público e chamada para
              ação.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="post-tags" className={labelClassName}>
                Tags
              </label>
              <span className="text-[11px] tabular-nums text-ds-text-subtle">
                {form.tags.length} {form.tags.length === 1 ? "tag" : "tags"}
              </span>
            </div>
            <div className="relative">
              <TagIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-subtle" />
              <input
                id="post-tags"
                type="text"
                value={form.tagDraft}
                onChange={(event) => form.setTagDraft(event.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => form.addTag(form.tagDraft)}
                placeholder="Digite uma tag e pressione Enter"
                className={`${inputClassName} pl-8`}
              />
            </div>

            {form.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-ds bg-ds-surface-hover py-0.5 pl-1.5 pr-1 text-[11px] font-medium leading-4 text-ds-text-subtle"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => form.removeTag(tag)}
                      aria-label={`Remover tag ${tag}`}
                      className="rounded-sm text-ds-text-subtle outline-none transition-colors hover:text-ds-danger-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            {suggestedTags.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <span className="text-[11px] text-ds-text-subtle">
                  Sugestões:
                </span>
                {suggestedTags.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => form.addTag(suggestion)}
                    className="inline-flex items-center gap-1 rounded-ds bg-ds-surface-hover px-1.5 py-0.5 text-[11px] font-medium leading-4 text-ds-text-subtle outline-none transition-colors hover:bg-ds-neutral-hover hover:text-ds-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                  >
                    <PlusIcon className="size-3" />
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <MediaStrip form={form} />
    </div>
  );
}
