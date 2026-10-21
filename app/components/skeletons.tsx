import type { ReactNode } from "react";
import { cx } from "@/app/lib/cx";
import { PageContainer } from "./ui";

const skeletonClassName =
  "animate-pulse rounded-ds bg-ds-surface-hover motion-reduce:animate-none";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx(skeletonClassName, className)} />;
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cx(
            "h-3",
            index === lines - 1 ? "w-2/3" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <PageContainer className={className}>
      <div role="status" aria-busy="true">
        <span className="sr-only">Carregando…</span>
        <div aria-hidden="true">{children}</div>
      </div>
    </PageContainer>
  );
}

export function SkeletonPageHeader({
  actions = 2,
  description = true,
}: {
  actions?: number;
  description?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-5">
      <div className="min-w-0 flex-1">
        <Skeleton className="h-8 w-40 max-w-full" />
        {description ? (
          <>
            <Skeleton className="mt-2 h-4 w-full max-w-md" />
            <Skeleton className="mt-1.5 h-4 w-3/5 max-w-sm" />
          </>
        ) : null}
      </div>
      {actions > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: actions }, (_, index) => (
            <Skeleton key={index} className="h-8 w-28" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="rounded-ds-lg border border-ds-line bg-ds-surface p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-28 max-w-full" />
              <Skeleton className="mt-2 h-8 w-24 max-w-full" />
              <Skeleton className="mt-1.5 h-3 w-36 max-w-full" />
            </div>
            <Skeleton className="size-8 shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCardHeader({
  action = false,
  description = true,
}: {
  action?: boolean;
  description?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ds-line px-4 py-3">
      <div className="min-w-0">
        <Skeleton className="h-4 w-32 max-w-full" />
        {description ? (
          <Skeleton className="mt-1.5 h-3 w-56 max-w-full" />
        ) : null}
      </div>
      {action ? <Skeleton className="h-6 w-16 shrink-0" /> : null}
    </div>
  );
}

export function SkeletonTable({
  columns = 5,
  rows = 5,
  minWidth = 840,
  richFirstColumn = false,
}: {
  columns?: number;
  rows?: number;
  minWidth?: number;
  richFirstColumn?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse text-left"
        style={{ minWidth }}
      >
        <thead>
          <tr className="border-b border-ds-line bg-ds-surface-hover/50">
            {Array.from({ length: columns }, (_, index) => (
              <th key={index} scope="col" className="px-4 py-2.5">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ds-line">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex} className="align-top">
              {Array.from({ length: columns }, (_, columnIndex) => (
                <td key={columnIndex} className="px-4 py-3">
                  {richFirstColumn && columnIndex === 0 ? (
                    <div className="max-w-[320px]">
                      <Skeleton className="h-4 w-3/5" />
                      <Skeleton className="mt-2 h-3 w-5/6" />
                      <div className="mt-2 flex gap-1">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                    </div>
                  ) : (
                    <Skeleton
                      className={cx(
                        "h-4",
                        columnIndex === columns - 1
                          ? "ml-auto w-8"
                          : columnIndex === 0
                            ? "w-28"
                            : "w-16",
                      )}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
