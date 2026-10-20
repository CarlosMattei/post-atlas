"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cx } from "@/app/lib/cx";
import { MAX_IMAGES } from "@/app/lib/post-form";
import { Button } from "../button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  PlusIcon,
  TrashIcon,
} from "../icons";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  inputClassName,
  labelClassName,
} from "../ui";
import type { PostFormController } from "./use-post-form";

export function MediaStrip({ form }: { form: PostFormController }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedIndex = form.images.findIndex(
    (image) => image.id === selectedId,
  );
  const selected = selectedIndex >= 0 ? form.images[selectedIndex] : null;

  const countLabel =
    form.images.length === 0
      ? "Sem mídia"
      : form.images.length === 1
        ? "1 imagem"
        : `${form.images.length} imagens`;

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <Card>
      <CardHeader
        title="Mídia"
        description="Uma imagem vai sozinha; a partir de duas, o LinkedIn monta um carrossel."
        action={
          <Badge
            tone={
              form.images.length > 1
                ? "discovery"
                : form.images.length === 1
                  ? "info"
                  : "neutral"
            }
          >
            {countLabel}
          </Badge>
        }
      />
      <CardBody>
        <div
          onDragOver={form.handleDragOver}
          onDragLeave={form.handleDragLeave}
          onDrop={form.handleDrop}
          className="flex flex-col gap-2"
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              form.addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          {form.images.length === 0 ? (
            <div
              className={cx(
                "flex flex-wrap items-center justify-between gap-2 rounded-ds-lg border border-dashed px-3 py-2.5 transition-colors",
                form.imagesDragging
                  ? "border-ds-brand bg-ds-surface-selected"
                  : "border-ds-line bg-ds-surface-hover/30",
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <ImageIcon className="size-4 shrink-0 text-ds-text-subtle" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ds-text">Sem mídia</p>
                  <p className="text-[11px] leading-4 text-ds-text-subtle">
                    PNG, JPG ou WebP · até {MAX_IMAGES} imagens
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onPress={openFilePicker}>
                <PlusIcon className="size-3.5" />
                Adicionar imagens
              </Button>
            </div>
          ) : (
            <>
              <div
                className={cx(
                  "flex gap-2 overflow-x-auto rounded-ds-lg border border-dashed p-2 transition-colors",
                  form.imagesDragging
                    ? "border-ds-brand bg-ds-surface-selected"
                    : "border-ds-line",
                )}
              >
                {form.images.map((image, index) => {
                  const isSelected = image.id === selectedId;

                  return (
                    <button
                      key={image.id}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`Imagem ${index + 1}${
                        index === 0 ? " (capa)" : ""
                      }`}
                      onClick={() =>
                        setSelectedId((current) =>
                          current === image.id ? null : image.id,
                        )
                      }
                      className={cx(
                        "relative size-20 shrink-0 overflow-hidden rounded-ds border outline-none transition-[box-shadow,border-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus",
                        isSelected
                          ? "border-ds-brand ring-2 ring-ds-brand ring-offset-1 ring-offset-ds-surface"
                          : "border-ds-line hover:border-ds-focus",
                      )}
                    >
                      <Image
                        src={image.url}
                        alt=""
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-cover"
                      />
                      {index === 0 ? (
                        <span className="absolute left-1 top-1 rounded-ds bg-ds-brand px-1 py-0.5 text-[10px] font-bold uppercase leading-3 text-ds-on-brand">
                          Capa
                        </span>
                      ) : null}
                      <span className="absolute bottom-1 right-1 rounded-ds bg-ds-text/80 px-1 text-[10px] font-semibold tabular-nums text-ds-surface">
                        {index + 1}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={openFilePicker}
                  aria-label="Adicionar imagens"
                  className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-ds border border-dashed border-ds-line text-ds-text-subtle outline-none transition-colors hover:border-ds-focus hover:text-ds-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                >
                  <PlusIcon className="size-4" />
                  <span className="text-[10px] font-medium">Adicionar</span>
                </button>
              </div>

              {selected ? (
                <div className="rounded-ds-lg border border-ds-line p-2.5">
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={`post-image-alt-${selected.id}`}
                        className={labelClassName}
                      >
                        Texto alternativo
                      </label>
                      <input
                        id={`post-image-alt-${selected.id}`}
                        type="text"
                        value={selected.alt}
                        onChange={(event) =>
                          form.updateAlt(selected.id, event.target.value)
                        }
                        placeholder="Descreva a imagem para acessibilidade"
                        className={inputClassName}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => form.makeCover(selectedIndex)}
                        isDisabled={selectedIndex === 0}
                      >
                        <ImageIcon className="size-3.5" />
                        Capa
                      </Button>
                      <Button
                        variant="subtle"
                        size="icon-sm"
                        aria-label="Mover imagem para trás"
                        isDisabled={selectedIndex === 0}
                        onPress={() => form.moveImage(selectedIndex, -1)}
                      >
                        <ChevronLeftIcon className="size-4" />
                      </Button>
                      <Button
                        variant="subtle"
                        size="icon-sm"
                        aria-label="Mover imagem para frente"
                        isDisabled={selectedIndex === form.images.length - 1}
                        onPress={() => form.moveImage(selectedIndex, 1)}
                      >
                        <ChevronRightIcon className="size-4" />
                      </Button>
                      <Button
                        variant="subtle"
                        size="icon-sm"
                        aria-label="Remover imagem"
                        onPress={() => {
                          form.removeImage(selected.id);
                          setSelectedId(null);
                        }}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="mt-1.5 text-[11px] leading-4 text-ds-text-subtle">
                    Imagem {selectedIndex + 1} de {form.images.length}. A
                    primeira é a capa do carrossel.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] leading-4 text-ds-text-subtle">
                  Clique em uma miniatura para editar texto alternativo, capa e
                  ordem. Também é possível arrastar arquivos para esta área.
                </p>
              )}
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
