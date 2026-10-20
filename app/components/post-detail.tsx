"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/app/lib/types";
import { Button } from "./button";
import { ConfirmDialog } from "./confirm-dialog";
import { XIcon } from "./icons";
import { PostDetailsDisclosure } from "./post-detail/post-details-disclosure";
import { PostEditor } from "./post-detail/post-editor";
import { PostHeader } from "./post-detail/post-header";
import { PostPreview } from "./post-detail/post-preview";
import { PublishPanel } from "./post-detail/publish-panel";
import { SaveBar } from "./post-detail/save-bar";
import {
  usePostForm,
  type PostFormController,
} from "./post-detail/use-post-form";
import { Alert, PageContainer } from "./ui";

function ContextualAlert({ form }: { form: PostFormController }) {
  if (form.status === "erro" && form.post.lastError) {
    return (
      <Alert
        tone="danger"
        title="A última execução falhou"
        className="mb-4"
        action={
          <Button variant="outline" size="sm" onPress={form.runNow}>
            Tentar novamente
          </Button>
        }
      >
        {form.post.lastError}
      </Alert>
    );
  }

  if (form.status === "arquivado") {
    return (
      <Alert
        tone="info"
        title="Post arquivado"
        className="mb-4"
        action={
          <Button variant="outline" size="sm" onPress={form.archive}>
            Restaurar
          </Button>
        }
      >
        Restaure o post para devolvê-lo como rascunho e liberá-lo para a fila de
        publicação.
      </Alert>
    );
  }

  if (form.status === "reprovado") {
    return (
      <Alert tone="warning" title="Post reprovado" className="mb-4">
        Ajuste o conteúdo e use a ação de aprovação para devolver o post à fila.
      </Alert>
    );
  }

  return null;
}

export function PostDetail({ post }: { post: Post }) {
  const form = usePostForm(post);
  const router = useRouter();
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <PageContainer>
      <PostHeader
        form={form}
        onRequestDiscard={() => setDiscardOpen(true)}
        onRequestDelete={() => setDeleteOpen(true)}
      />

      <ContextualAlert form={form} />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          {form.feedback ? (
            <Alert
              tone={form.feedback.tone}
              title={form.feedback.title}
              action={
                <Button
                  variant="subtle"
                  size="icon-sm"
                  aria-label="Fechar aviso"
                  onPress={form.dismissFeedback}
                >
                  <XIcon className="size-4" />
                </Button>
              }
            >
              {form.feedback.message}
            </Alert>
          ) : null}

          <PostEditor form={form} />
          <SaveBar form={form} />
        </div>

        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <PostPreview form={form} />
          <PublishPanel form={form} post={post} />
          <PostDetailsDisclosure form={form} post={post} />
        </aside>
      </div>

      <ConfirmDialog
        open={discardOpen}
        title="Descartar alterações não salvas?"
        description="O post voltará ao último estado salvo. Texto, tags, estratégia e mídia adicionada desde então serão descartados."
        confirmLabel="Descartar"
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => {
          form.discard();
          setDiscardOpen(false);
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Excluir este post?"
        description="Esta ação remove o post permanentemente do Neon e não pode ser desfeita."
        confirmLabel="Excluir post"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          if (await form.removePost()) router.push("/posts");
          setDeleteOpen(false);
        }}
      />
    </PageContainer>
  );
}
