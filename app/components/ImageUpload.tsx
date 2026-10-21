"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { MAX_IMAGES } from "@/app/lib/post-form";
import { uploadPostImage } from "@/app/lib/upload-image";
import { ImageIcon, PlusIcon, TrashIcon, UploadIcon } from "@/app/components/icons";

type UploadItem = {
  id: string;
  key?: string;
  url: string;
  alt: string;
  uploading: boolean;
};

interface ImageUploadProps {
  /** Nome do campo escondido enviado no FormData do post. */
  name?: string;
}

function fileAlt(file: File): string {
  return file.name.replace(/\.[^.]+$/, "").slice(0, 300);
}

/**
 * Upload das imagens de um post novo.
 *
 * Cada arquivo é redimensionado no navegador e enviado imediatamente ao bucket
 * privado do Neon. O formulário recebe só as chaves (`images` em JSON); nada de
 * credenciais S3 chegam ao cliente.
 */
export function ImageUpload({ name = "images" }: ImageUploadProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploading = items.some((item) => item.uploading);
  const value = JSON.stringify(
    items
      .filter((item) => item.key)
      .map((item) => ({ key: item.key, alt: item.alt })),
  );

  function openFilePicker() {
    inputRef.current?.click();
  }

  function revoke(url: string) {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  }

  function addFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) {
      setError("Selecione imagens em PNG, JPG, WebP ou GIF.");
      return;
    }

    const remaining = MAX_IMAGES - items.length;

    if (remaining <= 0) {
      setError(`O limite é de ${MAX_IMAGES} imagens por post.`);
      return;
    }

    setError(null);

    const accepted = files.slice(0, remaining);
    if (files.length > remaining) {
      setError(
        `Foram adicionadas ${remaining} de ${files.length} imagens. O limite é de ${MAX_IMAGES}.`,
      );
    }

    for (const file of accepted) {
      const item: UploadItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: URL.createObjectURL(file),
        alt: fileAlt(file),
        uploading: true,
      };

      setItems((current) => [...current, item]);

      uploadPostImage(file)
        .then((uploaded) => {
          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? { ...entry, ...uploaded, uploading: false }
                : entry,
            ),
          );
          revoke(item.url);
        })
        .catch((reason: unknown) => {
          setItems((current) =>
            current.filter((entry) => entry.id !== item.id),
          );
          revoke(item.url);
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível enviar a imagem.",
          );
        });
    }
  }

  function removeItem(item: UploadItem) {
    revoke(item.url);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-ds-text">Imagens</span>
        <span className="text-[11px] text-ds-text-subtle">
          {items.length} de {MAX_IMAGES}
        </span>
      </div>

      <input type="hidden" name={name} value={value} />

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
        className="sr-only"
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          const next = event.relatedTarget;
          if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={
          dragging
            ? "mt-1.5 rounded-ds-lg border border-dashed border-ds-brand bg-ds-surface-selected p-2"
            : "mt-1.5 rounded-ds-lg border border-dashed border-ds-line p-2"
        }
      >
        {items.length === 0 ? (
          <button
            type="button"
            onClick={openFilePicker}
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-ds px-4 py-6 text-center outline-none transition-colors hover:bg-ds-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-ds-surface text-ds-text-subtle shadow-ds-raised">
              <UploadIcon className="size-4" />
            </span>
            <span className="mt-2 text-sm font-medium text-ds-text">
              Arraste imagens ou selecione os arquivos
            </span>
            <span className="mt-0.5 text-xs text-ds-text-subtle">
              PNG, JPG, WebP ou GIF. Redimensionadas no navegador antes do
              upload.
            </span>
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="relative size-20 shrink-0 overflow-hidden rounded-ds border border-ds-line"
              >
                <Image
                  src={item.url}
                  alt={item.alt}
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

                {item.uploading ? (
                  <span className="absolute inset-x-0 bottom-0 bg-ds-text/80 px-1 py-0.5 text-center text-[10px] font-medium text-ds-surface">
                    Enviando…
                  </span>
                ) : null}

                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  aria-label={`Remover imagem ${index + 1}`}
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-ds-text/80 text-ds-surface outline-none transition-colors hover:bg-ds-danger-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                >
                  <TrashIcon className="size-3" />
                </button>
              </div>
            ))}

            {items.length < MAX_IMAGES ? (
              <button
                type="button"
                onClick={openFilePicker}
                className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-ds border border-dashed border-ds-line text-ds-text-subtle outline-none transition-colors hover:border-ds-focus hover:text-ds-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
              >
                <PlusIcon className="size-4" />
                <span className="text-[10px] font-medium">Adicionar</span>
              </button>
            ) : null}
          </div>
        )}
      </div>

      {error ? (
        <p role="alert" className="mt-1.5 text-xs leading-4 text-ds-danger-text">
          {error}
        </p>
      ) : (
        <p className="mt-1.5 text-xs leading-4 text-ds-text-subtle">
          <ImageIcon className="mr-1 inline size-3.5 align-[-2px]" />
          A primeira imagem é a capa. {uploading ? "Enviando imagens…" : "As imagens já ficam salvas no bucket ao serem selecionadas."}
        </p>
      )}
    </div>
  );
}
