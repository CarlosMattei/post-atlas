import {
  Skeleton,
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonTable,
} from "@/app/components/skeletons";
import { Card, CardFooter } from "@/app/components/ui";

export default function PostsLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actions={2} />

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-ds-line px-4 py-2.5">
          <Skeleton className="h-8 w-full sm:w-64" />
          <Skeleton className="h-8 w-full sm:w-40" />
          <Skeleton className="h-8 w-full sm:w-40" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>

        <SkeletonTable columns={6} rows={6} richFirstColumn />

        <CardFooter>
          <Skeleton className="h-3 w-64 max-w-full" />
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
