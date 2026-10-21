import {
  Skeleton,
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonTable,
} from "@/app/components/skeletons";
import { Card, CardFooter } from "@/app/components/ui";

export default function ArchivedLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actions={2} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-ds-lg border border-ds-line bg-ds-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 shrink-0" />
          <div>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-1 h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-7 w-28" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-ds-line px-4 py-2.5">
          <Skeleton className="h-8 w-full sm:w-64" />
          <Skeleton className="h-8 w-full sm:w-52" />
          <Skeleton className="ml-auto h-4 w-32" />
        </div>

        <SkeletonTable columns={5} rows={5} richFirstColumn />

        <CardFooter>
          <Skeleton className="h-3 w-72 max-w-full" />
          <div className="flex items-center gap-1">
            <Skeleton className="size-7" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="size-7" />
          </div>
        </CardFooter>
      </Card>
    </SkeletonPage>
  );
}
