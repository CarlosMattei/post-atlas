import {
  Skeleton,
  SkeletonCardHeader,
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonStatGrid,
} from "@/app/components/skeletons";
import { Card, CardBody, CardFooter } from "@/app/components/ui";

export default function HomeLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actions={2} />
      <SkeletonStatGrid />

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SkeletonCardHeader action />
          <ul className="divide-y divide-ds-line">
            {Array.from({ length: 4 }, (_, index) => (
              <li key={index} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-10 shrink-0" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-3/5 max-w-xs" />
                  <Skeleton className="mt-1.5 h-3 w-2/5 max-w-56" />
                </div>
                <Skeleton className="h-6 w-12 shrink-0" />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col">
          <SkeletonCardHeader action />
          <CardBody className="flex-1">
            <Skeleton className="h-24 w-full rounded-ds-lg" />
            <div className="mt-3 divide-y divide-ds-line">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          </CardBody>
          <CardFooter>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-20" />
          </CardFooter>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SkeletonCardHeader action />
          <ul className="divide-y divide-ds-line">
            {Array.from({ length: 4 }, (_, index) => (
              <li key={index} className="flex items-start gap-3 px-4 py-2.5">
                <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="mt-1.5 h-3 w-4/5" />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SkeletonCardHeader action />
          <ul className="divide-y divide-ds-line">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="px-4 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-4 w-8 shrink-0" />
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </li>
            ))}
          </ul>
          <CardFooter>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-32" />
          </CardFooter>
        </Card>
      </div>
    </SkeletonPage>
  );
}
