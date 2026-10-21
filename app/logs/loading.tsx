import {
  Skeleton,
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonStatGrid,
  SkeletonTable,
} from "@/app/components/skeletons";
import { Card, CardFooter } from "@/app/components/ui";

export default function LogsLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actions={2} />
      <SkeletonStatGrid />

      <Card className="mt-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-ds-line px-4 py-2.5">
          <Skeleton className="h-8 w-full sm:w-64" />
          <Skeleton className="h-8 w-full sm:w-44" />
          <Skeleton className="h-8 w-full sm:w-36" />
          <Skeleton className="h-8 w-full sm:w-40" />
          <Skeleton className="ml-auto h-4 w-20" />
        </div>

        <SkeletonTable columns={5} rows={6} minWidth={920} />

        <CardFooter>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
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
