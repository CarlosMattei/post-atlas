import {
  Skeleton,
  SkeletonPage,
  SkeletonPageHeader,
} from "@/app/components/skeletons";
import { Card, CardBody, CardFooter } from "@/app/components/ui";

export default function ConnectionLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actions={1} />

      <Skeleton className="h-20 w-full rounded-ds-lg" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-ds-lg border border-ds-line bg-ds-surface px-4 py-3">
        <div>
          <Skeleton className="h-4 w-56" />
          <Skeleton className="mt-1 h-3 w-44" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="flex flex-col">
            <div className="flex items-start gap-3 p-4 pb-3">
              <Skeleton className="size-9 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="mt-1.5 h-3 w-4/5" />
              </div>
            </div>
            <CardBody className="flex-1 pt-0">
              <div className="divide-y divide-ds-line">
                {Array.from({ length: 3 }, (_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
                  >
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </CardBody>
            <CardFooter>
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-7 w-24" />
            </CardFooter>
          </Card>
        ))}

        <Card className="flex flex-col lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ds-line px-4 py-3">
            <div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-1.5 h-3 w-72 max-w-full" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="rounded-ds-lg border border-ds-line p-3"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 shrink-0" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-1 h-3 w-5/6" />
              </div>
            ))}
          </CardBody>
          <CardFooter>
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardFooter>
        </Card>
      </div>
    </SkeletonPage>
  );
}
