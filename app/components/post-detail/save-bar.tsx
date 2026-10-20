import { cx } from "@/app/lib/cx";
import { formatTime } from "@/app/lib/format";
import { Button } from "../button";
import { CheckIcon } from "../icons";
import type { PostFormController } from "./use-post-form";

export function SaveBar({ form }: { form: PostFormController }) {
  const label = form.isDirty
    ? "Alterações não salvas"
    : form.savedAt
      ? `Salvo às ${formatTime(form.savedAt)}`
      : "Sem alterações pendentes";

  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-ds-lg border border-ds-line bg-ds-surface/95 px-3 py-2 shadow-ds-raised backdrop-blur">
      <div className="flex items-center gap-1.5 text-xs text-ds-text-subtle">
        <span
          aria-hidden="true"
          className={cx(
            "size-1.5 rounded-full",
            form.isDirty ? "bg-ds-warning-text" : "bg-ds-success-text",
          )}
        />
        <span aria-live="polite">{label}</span>
      </div>

      <Button
        variant="primary"
        size="sm"
        isDisabled={!form.isDirty}
        onPress={form.save}
      >
        <CheckIcon className="size-4" />
        Salvar alterações
      </Button>
    </div>
  );
}
