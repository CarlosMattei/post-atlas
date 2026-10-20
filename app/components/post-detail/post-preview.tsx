"use client";

import Image from "next/image";
import { useState } from "react";
import { cx } from "@/app/lib/cx";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../icons";
import { Card, CardBody, CardHeader } from "../ui";
import type { PostFormController } from "./use-post-form";

export function PostPreview({ form }: { form: PostFormController }) {
  const [expanded, setExpanded] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const activeIndex = Math.min(
    carouselIndex,
    Math.max(form.images.length - 1, 0),
  );
  const activeImage = form.images[activeIndex];
  const canExpand = form.body.trim().length > 240;
  const body = form.body.trim() || "O texto do post aparecerá aqui.";

  return (
    <Card>
      <CardHeader
        title="Pré-visualização"
        description="Como o post aparecerá no LinkedIn."
      />
      <CardBody className="p-3">
        <div className="rounded-ds-lg border border-ds-line">
          <div className="flex items-start gap-2.5 p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ds-brand text-sm font-semibold text-ds-on-brand">
              CM
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-5 text-ds-text">
                Carlos Mattei
              </p>
              <p className="line-clamp-1 text-[11px] leading-4 text-ds-text-subtle">
                Criando sistemas simples para problemas complexos
              </p>
              <p className="text-[11px] text-ds-text-subtle">
                agora · público
              </p>
            </div>
          </div>

          <p
            className={cx(
              "whitespace-pre-line px-3 text-sm leading-5 text-ds-text-subtle",
              !expanded && "line-clamp-6",
            )}
          >
            {body}
          </p>

          {canExpand ? (
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((current) => !current)}
              className="mt-1 rounded-sm px-3 text-xs font-semibold text-ds-info-text outline-none transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
            >
              {expanded ? "Ver menos" : "Ver mais"}
            </button>
          ) : null}

          {activeImage ? (
            <div className="relative mt-3 aspect-[1.91/1] border-y border-ds-line bg-ds-surface-hover">
              <Image
                src={activeImage.url}
                alt={activeImage.alt}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 380px"
                className="object-cover"
              />

              {form.images.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Imagem anterior do carrossel"
                    onClick={() =>
                      setCarouselIndex(
                        (activeIndex - 1 + form.images.length) %
                          form.images.length,
                      )
                    }
                    className="absolute left-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-ds-surface/90 text-ds-text shadow-ds-raised outline-none transition-colors hover:bg-ds-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                  >
                    <ChevronLeftIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Próxima imagem do carrossel"
                    onClick={() =>
                      setCarouselIndex((activeIndex + 1) % form.images.length)
                    }
                    className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-ds-surface/90 text-ds-text shadow-ds-raised outline-none transition-colors hover:bg-ds-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                  >
                    <ChevronRightIcon className="size-4" />
                  </button>

                  <span className="absolute right-2 top-2 rounded-ds bg-ds-text/80 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-ds-surface">
                    {activeIndex + 1}/{form.images.length}
                  </span>

                  <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1">
                    {form.images.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        aria-label={`Ir para a imagem ${index + 1}`}
                        aria-current={index === activeIndex ? "true" : undefined}
                        onClick={() => setCarouselIndex(index)}
                        className={cx(
                          "size-1.5 rounded-full outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus",
                          index === activeIndex
                            ? "bg-ds-surface"
                            : "bg-ds-surface/50 hover:bg-ds-surface/80",
                        )}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {form.tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1 px-3 pt-2.5 text-xs font-medium text-ds-info-text">
              {form.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          ) : null}

          <div className="h-2" />
        </div>
      </CardBody>
    </Card>
  );
}
