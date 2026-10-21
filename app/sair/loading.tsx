import {
  Skeleton,
  SkeletonPage,
  SkeletonText,
} from "@/app/components/skeletons";
import { Card, CardBody, CardFooter } from "@/app/components/ui";

export default function LogoutLoading() {
  return (
    <SkeletonPage className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardBody className="px-6 py-8 text-center">
          <Skeleton className="mx-auto size-12 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-6 w-40" />
          <SkeletonText
            lines={2}
            className="mx-auto mt-2 w-full max-w-sm items-center"
          />

          <div className="mt-5 rounded-ds-lg border border-ds-line p-3 text-left">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="mt-2 divide-y divide-ds-line">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
                >
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Skeleton className="h-8 w-full sm:w-32" />
            <Skeleton className="h-8 w-full sm:w-32" />
          </div>
        </CardBody>
        <CardFooter className="justify-center">
          <Skeleton className="h-3 w-full max-w-xs" />
        </CardFooter>
      </Card>
    </SkeletonPage>
  );
}
