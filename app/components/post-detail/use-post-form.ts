"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import { formatDateTime } from "@/app/lib/format";
import {
  deletePost as removePostFromDatabase,
  updatePost as persistPost,
  updatePostStatus,
} from "@/app/lib/post-actions";
import {
  MAX_IMAGES,
  getPrimaryAction,
  getReadiness,
  isDirty,
  type PostFormValues,
  type PublishStrategy,
} from "@/app/lib/post-form";
import type { Post, PostStatus } from "@/app/lib/types";
import { uploadPostImage } from "@/app/lib/upload-image";

export type FeedbackTone = "info" | "success" | "warning" | "danger";

export type PostFeedback = {
  tone: FeedbackTone;
  title: string;
  message?: string;
};

function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";

  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function initialValues(post: Post): PostFormValues {
  return {
    title: post.title,
    body: post.body,
    tags: [...post.tags],
    images: [...(post.images ?? [])],
    strategy: post.scheduledAt ? "fixo" : "fila",
    scheduledAtDraft: toDateTimeLocal(post.scheduledAt),
  };
}

function snapshotOf(values: PostFormValues): PostFormValues {
  return {
    ...values,
    tags: [...values.tags],
    images: values.images.map((image) => ({ ...image })),
  };
}

export function usePostForm(post: Post) {
  const [values, setValues] = useState<PostFormValues>(() =>
    initialValues(post),
  );
  const [saved, setSaved] = useState<PostFormValues>(() =>
    snapshotOf(initialValues(post)),
  );
  const [tagDraft, setTagDraft] = useState("");
  const [imagesDragging, setImagesDragging] = useState(false);
  const [status, setStatus] = useState<PostStatus>(post.status);
  const [scheduledAt, setScheduledAt] = useState(post.scheduledAt);
  const [publishedAt, setPublishedAt] = useState(post.publishedAt);
  const [linkedinPostId, setLinkedinPostId] = useState(post.linkedinPostId);
  const [updatedAt, setUpdatedAt] = useState(post.updatedAt);
  const [savedAt, setSavedAt] = useState<string | null>(post.updatedAt);
  const [feedback, setFeedback] = useState<PostFeedback | null>(null);

  const objectUrls = useRef<string[]>([]);
  const pendingFiles = useRef(new Map<string, File>());
  const publishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dirty = isDirty(values, saved);
  const readiness = getReadiness(values);
  const primaryAction = getPrimaryAction(status, values.strategy, readiness);

  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));

      if (publishTimer.current) {
        clearTimeout(publishTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      !feedback ||
      (feedback.tone !== "success" && feedback.tone !== "info")
    ) {
      return;
    }

    const timer = setTimeout(() => setFeedback(null), 4000);

    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!dirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    function handleDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || href.startsWith("#")) return;

      if (
        !window.confirm(
          "Você tem alterações não salvas. Deseja sair desta página?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [dirty]);

  function notify(tone: FeedbackTone, title: string, message?: string) {
    setFeedback({ tone, title, message });
  }

  function dismissFeedback() {
    setFeedback(null);
  }

  function setTitle(title: string) {
    setValues((current) => ({ ...current, title }));
  }

  function setBody(body: string) {
    setValues((current) => ({ ...current, body }));
  }

  function setStrategy(strategy: PublishStrategy) {
    setValues((current) => ({ ...current, strategy }));
  }

  function setScheduledAtDraft(scheduledAtDraft: string) {
    setValues((current) => ({ ...current, scheduledAtDraft }));
  }

  function addTag(raw: string) {
    const value = raw.trim().replace(/^#/, "").toLowerCase();

    if (!value || values.tags.includes(value)) return;

    setValues((current) => ({ ...current, tags: [...current.tags, value] }));
    setTagDraft("");
  }

  function removeTag(tag: string) {
    setValues((current) => ({
      ...current,
      tags: current.tags.filter((item) => item !== tag),
    }));
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagDraft);
    }

    if (event.key === "Backspace" && tagDraft === "" && values.tags.length > 0) {
      removeTag(values.tags[values.tags.length - 1]);
    }
  }

  function revokeObjectUrl(url: string) {
    if (!objectUrls.current.includes(url)) return;

    URL.revokeObjectURL(url);
    objectUrls.current = objectUrls.current.filter((item) => item !== url);
  }

  function addFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);

    if (files.length === 0) return;

    const valid = files.filter((file) =>
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      ),
    );

    if (valid.length === 0) {
      notify(
        "danger",
        "Arquivo não suportado",
        "Envie imagens em PNG, JPG, WebP ou GIF.",
      );
      return;
    }

    const remaining = MAX_IMAGES - values.images.length;

    if (remaining <= 0) {
      notify(
        "warning",
        "Limite de imagens atingido",
        `O carrossel do LinkedIn aceita até ${MAX_IMAGES} imagens. Remova uma para adicionar outra.`,
      );
      return;
    }

    const accepted = valid.slice(0, remaining);
    const added = accepted.map((file) => {
      const url = URL.createObjectURL(file);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      objectUrls.current.push(url);
      pendingFiles.current.set(id, file);

      return {
        id,
        url,
        alt: file.name.replace(/\.[^.]+$/, ""),
      };
    });

    setValues((current) => ({
      ...current,
      images: [...current.images, ...added],
    }));

    if (valid.length > remaining) {
      notify(
        "warning",
        "Algumas imagens não entraram",
        `Foram adicionadas ${added.length} de ${valid.length}. O limite é de ${MAX_IMAGES} imagens por post.`,
      );
      return;
    }

    notify(
      "success",
      added.length > 1 ? "Carrossel atualizado" : "Imagem adicionada",
      added.length > 1
        ? `${values.images.length + added.length} imagens no carrossel. A primeira é a capa.`
        : "A imagem foi anexada ao rascunho e aparece na pré-visualização.",
    );
  }

  function removeImage(id: string) {
    const target = values.images.find((image) => image.id === id);

    if (target) revokeObjectUrl(target.url);
    pendingFiles.current.delete(id);

    setValues((current) => ({
      ...current,
      images: current.images.filter((image) => image.id !== id),
    }));
  }

  function moveImage(index: number, offset: number) {
    const targetIndex = index + offset;

    if (targetIndex < 0 || targetIndex >= values.images.length) return;

    setValues((current) => {
      const next = [...current.images];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return { ...current, images: next };
    });
  }

  function makeCover(index: number) {
    if (index <= 0) return;

    setValues((current) => {
      const next = [...current.images];
      const [cover] = next.splice(index, 1);
      return { ...current, images: [cover, ...next] };
    });

    notify(
      "success",
      "Capa atualizada",
      "A imagem escolhida abre o carrossel no LinkedIn.",
    );
  }

  function updateAlt(id: string, alt: string) {
    setValues((current) => ({
      ...current,
      images: current.images.map((image) =>
        image.id === id ? { ...image, alt } : image,
      ),
    }));
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setImagesDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    const next = event.relatedTarget;

    if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
      setImagesDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setImagesDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function cancelPendingPublish() {
    if (publishTimer.current) {
      clearTimeout(publishTimer.current);
      publishTimer.current = null;
    }
  }

  async function save(): Promise<boolean> {
    let nextImages = values.images;

    try {
      const pending = nextImages.filter((image) =>
        image.url.startsWith("blob:"),
      );

      if (pending.length > 0) {
        notify(
          "info",
          "Enviando imagens…",
          `Enviando ${pending.length} ${
            pending.length === 1 ? "imagem" : "imagens"
          } para o bucket do Neon.`,
        );

        const uploaded = new Map<string, { key: string; url: string }>();

        for (const image of pending) {
          const file = pendingFiles.current.get(image.id);

          if (!file) {
            throw new Error(
              "Uma das imagens não está mais disponível. Remova-a e selecione novamente.",
            );
          }

          uploaded.set(image.id, await uploadPostImage(file));
        }

        nextImages = nextImages.map((image) => {
          const result = uploaded.get(image.id);

          if (!result) return image;

          revokeObjectUrl(image.url);
          pendingFiles.current.delete(image.id);

          return { ...image, key: result.key, url: result.url };
        });

        setValues((current) => ({ ...current, images: nextImages }));
      }

      const nextScheduledAt =
        status === "agendado" &&
        values.strategy === "fixo" &&
        values.scheduledAtDraft
          ? new Date(values.scheduledAtDraft).toISOString()
          : null;
      await persistPost(post.id, {
        title: values.title,
        body: values.body,
        tags: values.tags,
        images: nextImages.map((image) => ({
          key: image.key ?? image.url,
          alt: image.alt,
        })),
        scheduledAt: nextScheduledAt,
      });
      const now = new Date().toISOString();
      setSaved(snapshotOf({ ...values, images: nextImages }));
      setSavedAt(now);
      setUpdatedAt(now);
      if (status === "agendado" && !nextScheduledAt) {
        setStatus("aprovado");
        setScheduledAt(null);
      } else if (status === "agendado") {
        setScheduledAt(nextScheduledAt);
      }
      notify(
        "success",
        "Alterações salvas",
        "Título, texto, tags, imagens e agendamento foram atualizados no Neon.",
      );
      return true;
    } catch (error) {
      notify(
        "danger",
        "Não foi possível salvar",
        error instanceof Error ? error.message : "Erro ao salvar o post.",
      );
      return false;
    }
  }

  async function removePost(): Promise<boolean> {
    try {
      await removePostFromDatabase(post.id);
      return true;
    } catch (error) {
      notify(
        "danger",
        "Não foi possível excluir o post",
        error instanceof Error ? error.message : "Erro ao excluir o post.",
      );
      return false;
    }
  }

  function discard() {
    cancelPendingPublish();

    values.images.forEach((image) => {
      if (
        objectUrls.current.includes(image.url) &&
        !saved.images.some((savedImage) => savedImage.url === image.url)
      ) {
        revokeObjectUrl(image.url);
        pendingFiles.current.delete(image.id);
      }
    });

    setValues(snapshotOf(saved));
    setTagDraft("");
    notify(
      "info",
      "Alterações descartadas",
      "O post voltou ao último estado salvo.",
    );
  }

  async function persistStatus(
    nextStatus: PostStatus,
    nextScheduledAt: string | null,
    title: string,
    message: string,
    tone: FeedbackTone = "success",
  ): Promise<boolean> {
    if (dirty && !(await save())) return false;

    try {
      await updatePostStatus(post.id, nextStatus, nextScheduledAt);
      setStatus(nextStatus);
      setScheduledAt(nextScheduledAt);
      setUpdatedAt(new Date().toISOString());
      notify(tone, title, message);
      return true;
    } catch (error) {
      notify(
        "danger",
        "Não foi possível atualizar o post",
        error instanceof Error ? error.message : "Erro ao atualizar o status.",
      );
      return false;
    }
  }

  async function enqueue(approved: boolean) {
    if (!values.title.trim() || !values.body.trim()) {
      notify(
        "danger",
        "Faltam informações para aprovar",
        "Preencha o título e o texto do post antes de enviar para revisão.",
      );
      return;
    }

    await persistStatus(
      "aprovado",
      null,
      approved ? "Post aprovado e enfileirado" : "Post enviado para a fila",
      "A publicação acontece no próximo dia útil às 09:00, conforme a ordem manual e o score.",
    );
  }

  async function scheduleFixed(approved: boolean) {
    if (approved && (!values.title.trim() || !values.body.trim())) {
      notify(
        "danger",
        "Faltam informações para aprovar",
        "Preencha o título e o texto do post antes de agendar.",
      );
      return;
    }

    if (!values.scheduledAtDraft) {
      notify(
        "danger",
        "Defina data e hora",
        "Escolha quando o post deve ser publicado antes de agendar.",
      );
      return;
    }

    const parsed = new Date(values.scheduledAtDraft);

    if (Number.isNaN(parsed.getTime())) {
      notify("danger", "Data inválida", "Revise a data e a hora informadas.");
      return;
    }

    const iso = parsed.toISOString();

    if (
      await persistStatus(
        "agendado",
        iso,
        approved ? "Post aprovado e agendado" : "Postagem agendada",
        `Publicação marcada para ${formatDateTime(iso)}.`,
      )
    ) {
      setSaved((current) => ({
        ...current,
        strategy: values.strategy,
        scheduledAtDraft: values.scheduledAtDraft,
      }));
    }
  }

  async function cancelSchedule() {
    cancelPendingPublish();
    if (
      await persistStatus(
        "aprovado",
        null,
        "Agendamento cancelado",
        "O post continua aprovado e volta a disputar a fila.",
        "info",
      )
    ) {
      setValues((current) => ({
        ...current,
        strategy: "fila",
        scheduledAtDraft: "",
      }));
      setSaved((current) => ({
        ...current,
        strategy: "fila",
        scheduledAtDraft: "",
      }));
    }
  }

  function runPrimary() {
    switch (primaryAction.kind) {
      case "approve-queue":
        enqueue(true);
        break;
      case "approve-schedule":
        scheduleFixed(true);
        break;
      case "queue":
        enqueue(false);
        break;
      case "schedule":
        scheduleFixed(false);
        break;
      case "cancel-schedule":
        cancelSchedule();
        break;
      default:
        break;
    }
  }

  async function reject() {
    cancelPendingPublish();
    await persistStatus(
      "reprovado",
      null,
      "Post reprovado",
      "O conteúdo voltou para revisão e não será publicado até ser aprovado novamente.",
      "warning",
    );
  }

  async function archive() {
    cancelPendingPublish();

    if (status === "arquivado") {
      await persistStatus(
        "rascunho",
        null,
        "Post restaurado",
        "O post voltou como rascunho, fora da fila, pronto para ser editado.",
        "info",
      );
      return;
    }

    await persistStatus(
      "arquivado",
      null,
      "Post arquivado",
      "O post saiu da fila e a prévia continua disponível em Arquivados.",
      "info",
    );
  }

  function runNow() {
    cancelPendingPublish();
    setStatus("publicando");
    notify(
      "info",
      "Executando publicação",
      "O workflow está enviando o post para o LinkedIn. O resultado aparece aqui em instantes.",
    );

    publishTimer.current = setTimeout(() => {
      publishTimer.current = null;
      const now = new Date().toISOString();

      setStatus("publicado");
      setPublishedAt(now);
      setUpdatedAt(now);
      setLinkedinPostId(`urn:li:share:${Date.now()}`);
      notify(
        "success",
        "Post publicado",
        "O workflow confirmou a publicação e gravou o ID do LinkedIn.",
      );
    }, 1800);
  }

  return {
    post,
    title: values.title,
    body: values.body,
    tags: values.tags,
    images: values.images,
    strategy: values.strategy,
    scheduledAtDraft: values.scheduledAtDraft,
    tagDraft,
    imagesDragging,
    status,
    scheduledAt,
    publishedAt,
    linkedinPostId,
    updatedAt,
    savedAt,
    feedback,
    isDirty: dirty,
    readiness,
    primaryAction,
    setTitle,
    setBody,
    setTagDraft,
    addTag,
    removeTag,
    handleTagKeyDown,
    setStrategy,
    setScheduledAtDraft,
    addFiles,
    removeImage,
    moveImage,
    makeCover,
    updateAlt,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    save,
    discard,
    dismissFeedback,
    runPrimary,
    reject,
    archive,
    runNow,
    removePost,
  };
}

export type PostFormController = ReturnType<typeof usePostForm>;
