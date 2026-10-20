import type { ComponentType, ReactNode, SVGProps } from "react";
import { cx } from "@/app/lib/cx";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  SparklesIcon,
  XCircleIcon,
} from "./icons";
import {
  logResultLabels,
  statusLabels,
} from "@/app/lib/format";
import type {
  IntegrationStatus,
  LogResult,
  PostStatus,
} from "@/app/lib/types";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "discovery";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-ds-neutral-bg text-ds-neutral-text",
  info: "bg-ds-info-bg text-ds-info-text",
  success: "bg-ds-success-bg text-ds-success-text",
  warning: "bg-ds-warning-bg text-ds-warning-text",
  danger: "bg-ds-danger-bg text-ds-danger-text",
  discovery: "bg-ds-discovery-bg text-ds-discovery-text",
};

const statusTones: Record<PostStatus, Tone> = {
  rascunho: "neutral",
  aprovado: "info",
  reprovado: "danger",
  agendado: "discovery",
  publicando: "warning",
  publicado: "success",
  erro: "danger",
  arquivado: "neutral",
};

const resultTones: Record<LogResult, Tone> = {
  sucesso: "success",
  erro: "danger",
  ignorado: "neutral",
};

const integrationTones: Record<IntegrationStatus, Tone> = {
  conectado: "success",
  atencao: "warning",
  desconectado: "danger",
};

const integrationLabels: Record<IntegrationStatus, string> = {
  conectado: "Conectado",
  atencao: "Atenção",
  desconectado: "Desconectado",
};

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-5">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold leading-8 tracking-tight text-ds-text">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-5 text-ds-text-subtle">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-ds-lg border border-ds-line bg-ds-surface",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-wrap items-start justify-between gap-3 border-b border-ds-line px-4 py-3",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold leading-5 text-ds-text">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs leading-4 text-ds-text-subtle">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx("p-4", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-wrap items-center justify-between gap-3 border-t border-ds-line px-4 py-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-ds px-1.5 py-0.5 text-[11px] font-bold uppercase leading-4 tracking-[0.02em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: PostStatus }) {
  return <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>;
}

export function ResultBadge({ result }: { result: LogResult }) {
  return <Badge tone={resultTones[result]}>{logResultLabels[result]}</Badge>;
}

export function IntegrationBadge({ status }: { status: IntegrationStatus }) {
  return <Badge tone={integrationTones[status]}>{integrationLabels[status]}</Badge>;
}

export function ScorePill({ score }: { score: number }) {
  const tone: Tone =
    score >= 85
      ? "success"
      : score >= 70
        ? "info"
        : score >= 50
          ? "warning"
          : "danger";

  return (
    <span
      aria-label={`Score ${score} de 100`}
      className={cx(
        "inline-flex items-center gap-1 rounded-ds px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        toneClasses[tone],
      )}
    >
      <SparklesIcon className="size-3.5" />
      {score}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-ds bg-ds-surface-hover px-1.5 py-0.5 text-[11px] font-medium leading-4 text-ds-text-subtle">
      {children}
    </span>
  );
}

type AlertTone = "info" | "success" | "warning" | "danger";

const alertTones: Record<AlertTone, { wrapper: string; icon: string }> = {
  info: { wrapper: "bg-ds-info-bg text-ds-info-text", icon: "text-ds-info-text" },
  success: {
    wrapper: "bg-ds-success-bg text-ds-success-text",
    icon: "text-ds-success-text",
  },
  warning: {
    wrapper: "bg-ds-warning-bg text-ds-warning-text",
    icon: "text-ds-warning-text",
  },
  danger: {
    wrapper: "bg-ds-danger-bg text-ds-danger-text",
    icon: "text-ds-danger-text",
  },
};

const alertIcons: Record<AlertTone, ComponentType<SVGProps<SVGSVGElement>>> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: AlertTriangleIcon,
  danger: XCircleIcon,
};

export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = alertIcons[tone];

  return (
    <div
      role="status"
      className={cx(
        "flex flex-wrap items-start gap-3 rounded-ds-lg px-4 py-3",
        alertTones[tone].wrapper,
        className,
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5">{title}</p>
        {children ? (
          <div className="mt-0.5 text-sm leading-5 opacity-90">{children}</div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold leading-8 text-ds-text tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="mt-0.5 truncate text-xs leading-4 text-ds-text-subtle">
              {hint}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-ds bg-ds-info-bg text-ds-info-text">
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-ds-surface-hover text-ds-text-subtle">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-ds-text">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-5 text-ds-text-subtle">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export const inputClassName =
  "h-8 w-full rounded-ds border border-ds-line bg-ds-surface px-2.5 text-sm text-ds-text outline-none transition-colors placeholder:text-ds-text-subtle focus:border-ds-focus focus:ring-2 focus:ring-ds-info-bg";

export const selectClassName =
  "h-8 w-full rounded-ds border border-ds-line bg-ds-surface px-2 text-sm text-ds-text outline-none transition-colors focus:border-ds-focus focus:ring-2 focus:ring-ds-info-bg";

export const labelClassName =
  "mb-1 block text-xs font-semibold leading-4 text-ds-text-subtle";

export function DetailList({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <dl className="divide-y divide-ds-line">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0"
        >
          <dt className="shrink-0 text-xs text-ds-text-subtle">{item.label}</dt>
          <dd className="min-w-0 break-words text-right text-xs font-medium text-ds-text">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
