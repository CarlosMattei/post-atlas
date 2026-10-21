"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { evaluatePostsWithoutScore } from "@/app/lib/score-actions";
import { Button } from "./button";
import { SparklesIcon } from "./icons";
import { useToast } from "./toast";

export function ScoreEvaluateButton({ pending }: { pending: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const isEmpty = pending === 0 && !isPending;

  async function handlePress() {
    setIsPending(true);

    try {
      const result = await evaluatePostsWithoutScore();

      if (result.evaluated === 0 && result.failed === 0) {
        toast({
          tone: "info",
          title: "Nada para avaliar",
          message: "Todos os posts em rascunho ou aprovados já têm score.",
        });
        return;
      }

      if (result.evaluated === 0) {
        toast({
          tone: "danger",
          title: "Nenhum score foi gravado",
          message: result.errors[0] ?? "O n8n recusou os posts enviados.",
        });
        return;
      }

      const leftover =
        result.remaining > 0
          ? ` ${result.remaining} ${result.remaining === 1 ? "post ainda está" : "posts ainda estão"} sem score.`
          : "";

      if (result.failed === 0) {
        toast({
          tone: "success",
          title: `${result.evaluated} ${result.evaluated === 1 ? "post avaliado" : "posts avaliados"}`,
          message: `A nota da IA já está no banco.${leftover}`,
        });
      } else {
        toast({
          tone: "info",
          title: `${result.evaluated} avaliados, ${result.failed} com falha`,
          message: `${result.errors.join(" · ")}${leftover}`,
        });
      }

      router.refresh();
    } catch (error) {
      toast({
        tone: "danger",
        title: "Falha ao avaliar scores",
        message:
          error instanceof Error
            ? error.message
            : "Erro ao chamar o webhook do n8n.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant="outline"
      onPress={handlePress}
      isPending={isPending}
      isDisabled={isEmpty}
      aria-label={
        pending > 0
          ? `Avaliar ${pending} ${pending === 1 ? "post sem score" : "posts sem score"}`
          : "Todos os posts elegíveis já têm score"
      }
    >
      <SparklesIcon className="size-4" />
      {isPending
        ? "Avaliando…"
        : pending > 0
          ? `Avaliar scores (${pending})`
          : "Scores em dia"}
    </Button>
  );
}
