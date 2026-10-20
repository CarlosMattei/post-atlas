import { ToggleButton } from "react-aria-components/ToggleButton";
import { ToggleButtonGroup } from "react-aria-components/ToggleButtonGroup";
import { cx } from "@/app/lib/cx";
import { effectiveScore } from "@/app/lib/format";
import { canReject } from "@/app/lib/post-form";
import type { Post } from "@/app/lib/types";
import { Button } from "../button";
import { CheckCircleIcon } from "../icons";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  ScorePill,
  inputClassName,
  labelClassName,
} from "../ui";
import type { PostFormController } from "./use-post-form";

export function PublishPanel({
  form,
  post,
}: {
  form: PostFormController;
  post: Post;
}) {
  const { readiness, primaryAction } = form;
  const completed = [
    readiness.title,
    readiness.body,
    readiness.tags,
    readiness.strategy,
  ].filter(Boolean).length;

  const checklist = [
    { label: "Título entre 1 e 200 caracteres", done: readiness.title },
    { label: "Texto entre 1 e 3000 caracteres", done: readiness.body },
    { label: "Pelo menos uma tag de organização", done: readiness.tags },
    {
      label:
        form.strategy === "fixo"
          ? "Data e hora do agendamento definidas"
          : "Estratégia de publicação definida",
      done: readiness.strategy,
    },
  ];

  return (
    <Card>
      <CardHeader
        title="Publicação"
        description="Defina como o post entra na fila."
      />
      <CardBody className="flex flex-col gap-3">
        <div>
          <span className={labelClassName}>Estratégia</span>
          <ToggleButtonGroup
            aria-label="Estratégia de publicação"
            selectionMode="single"
            selectedKeys={[form.strategy]}
            onSelectionChange={(keys) => {
              const [key] = Array.from(keys);

              if (key === "fila" || key === "fixo") {
                form.setStrategy(key);
              }
            }}
            className="grid grid-cols-2 gap-1 rounded-ds bg-ds-surface-hover p-1"
          >
            <ToggleButton
              id="fila"
              className={({ isSelected }) =>
                cx(
                  "h-7 cursor-pointer rounded-ds px-2 text-[13px] font-medium outline-none transition-colors",
                  "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-ds-focus",
                  isSelected
                    ? "bg-ds-surface text-ds-text shadow-ds-raised"
                    : "text-ds-text-subtle data-[hovered]:text-ds-text",
                )
              }
            >
              Entrar na fila
            </ToggleButton>
            <ToggleButton
              id="fixo"
              className={({ isSelected }) =>
                cx(
                  "h-7 cursor-pointer rounded-ds px-2 text-[13px] font-medium outline-none transition-colors",
                  "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-ds-focus",
                  isSelected
                    ? "bg-ds-surface text-ds-text shadow-ds-raised"
                    : "text-ds-text-subtle data-[hovered]:text-ds-text",
                )
              }
            >
              Data e hora fixas
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

        {form.strategy === "fixo" ? (
          <div>
            <label htmlFor="publish-at" className={labelClassName}>
              Data e hora
            </label>
            <input
              id="publish-at"
              type="datetime-local"
              value={form.scheduledAtDraft}
              onChange={(event) =>
                form.setScheduledAtDraft(event.target.value)
              }
              className={inputClassName}
            />
            <p className="mt-1 text-[11px] leading-4 text-ds-text-subtle">
              Horário em America/Sao_Paulo.
            </p>
          </div>
        ) : (
          <p className="rounded-ds-lg bg-ds-surface-hover px-2.5 py-2 text-[11px] leading-4 text-ds-text-subtle">
            Publica no próximo dia útil às 09:00, conforme a ordem manual e o
            score.
          </p>
        )}

        <div className="rounded-ds-lg border border-ds-line p-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle">
              Prontidão
            </p>
            <Badge tone={readiness.allReady ? "success" : "neutral"}>
              {readiness.allReady
                ? "Pronto para publicar"
                : `${completed} de 4`}
            </Badge>
          </div>

          <ul className="mt-2 flex flex-col gap-1.5 text-[11px] leading-4 text-ds-text-subtle">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-start gap-1.5">
                {item.done ? (
                  <CheckCircleIcon className="mt-px size-3.5 shrink-0 text-ds-success-text" />
                ) : (
                  <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border border-ds-line">
                    <span className="size-1 rounded-full bg-ds-text-subtle/40" />
                  </span>
                )}
                <span className={item.done ? "text-ds-text" : undefined}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle">
              Score efetivo
            </p>
            <p className="text-[11px] leading-4 text-ds-text-subtle">
              IA {post.aiScore ?? "—"} · manual {post.scoreOverride ?? "—"}
            </p>
          </div>
          <ScorePill score={effectiveScore(post)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Button
            variant="primary"
            className="w-full"
            isDisabled={primaryAction.disabled}
            onPress={form.runPrimary}
          >
            {primaryAction.label}
          </Button>
          <p className="text-[11px] leading-4 text-ds-text-subtle">
            {primaryAction.helper}
          </p>

          {canReject(form.status) ? (
            <Button
              variant="subtle-danger"
              size="sm"
              className="w-full"
              onPress={form.reject}
            >
              Reprovar
            </Button>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
