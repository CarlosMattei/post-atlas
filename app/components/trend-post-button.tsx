"use client";

import { useState } from "react";
import { triggerTrendToPost } from "@/app/lib/trend-actions";
import type { TrendItem } from "@/app/lib/types";
import { Button } from "./button";
import { SparklesIcon } from "./icons";
import { useToast } from "./toast";

export function TrendPostButton({ trend }: { trend: TrendItem }) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  async function handlePress() {
    setIsPending(true);

    try {
      const result = await triggerTrendToPost(trend.id);

      toast({
        tone: "success",
        title: "Post criado a partir da tendência",
        message:
          result.detail ??
          `“${trend.title}” entrou no fluxo de score do LinkedIn.`,
      });
    } catch (error) {
      toast({
        tone: "danger",
        title: "Falha ao transformar em post",
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
      size="sm"
      onPress={handlePress}
      isPending={isPending}
      aria-label={`Transformar a tendência “${trend.title}” em post`}
    >
      <SparklesIcon className="size-4" />
      Transformar em post
    </Button>
  );
}
