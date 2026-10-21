import {
  Skeleton,
  SkeletonPage,
  SkeletonPageHeader,
} from "@/app/components/skeletons";
import { Card } from "@/app/components/ui";

export default function CalendarLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actions={2} />

      <Card className="flex flex-col overflow-hidden lg:h-[calc(100vh-11rem)] lg:min-h-[560px]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ds-line px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <Skeleton className="size-7 shrink-0" />
            <Skeleton className="size-7 shrink-0" />
            <div className="min-w-0 pl-1.5">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="mt-1 h-3 w-32 max-w-full" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="hidden h-3 w-40 sm:block" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-7 border-b border-ds-line bg-ds-surface-hover/50">
              {Array.from({ length: 7 }, (_, index) => (
                <div key={index} className="px-2 py-1.5">
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>

            <div className="grid min-w-[760px] auto-rows-fr grid-cols-7">
              {Array.from({ length: 35 }, (_, index) => (
                <div
                  key={index}
                  className={[
                    "flex min-h-[88px] min-w-0 flex-col gap-1 border-b border-r border-ds-line p-1.5 lg:min-h-0",
                    index % 7 >= 5
                      ? "bg-ds-surface-hover/30"
                      : "bg-ds-surface",
                  ].join(" ")}
                >
                  <Skeleton className="size-5 shrink-0 rounded-full" />
                  <div className="flex min-h-0 flex-1 flex-col gap-1">
                    {index % 4 === 0 ? (
                      <>
                        <Skeleton className="h-8 w-full" />
                        {index % 8 === 0 ? (
                          <Skeleton className="h-8 w-full" />
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="hidden w-56 shrink-0 flex-col border-l border-ds-line xl:flex">
            <div className="flex items-center justify-between gap-2 border-b border-ds-line px-3 py-2">
              <div className="min-w-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1 h-3 w-20" />
              </div>
              <Skeleton className="size-7 shrink-0" />
            </div>
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </aside>
        </div>
      </Card>
    </SkeletonPage>
  );
}
