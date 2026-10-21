import {
  Skeleton,
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonStatGrid,
} from "@/app/components/skeletons";
import { Card } from "@/app/components/ui";

export default function TrendsLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actions={0} />
      <SkeletonStatGrid />

      <Card className="mt-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-ds-line px-4 py-2.5">
          <Skeleton className="h-8 w-full sm:w-72" />
          <Skeleton className="h-8 w-full sm:w-40" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>

        <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className="min-w-0">
              <div className="flex h-full min-w-0 flex-col rounded-ds-lg border border-ds-line bg-ds-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="mt-3 h-4 w-11/12" />
                <Skeleton className="mt-1.5 h-4 w-3/4" />
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="mt-3 border-t border-ds-line pt-3">
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </SkeletonPage>
  );
}
