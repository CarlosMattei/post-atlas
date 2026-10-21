import {
  Skeleton,
  SkeletonPage,
  SkeletonText,
} from "@/app/components/skeletons";
import {
  Card,
  CardBody,
  CardHeader,
} from "@/app/components/ui";

function FieldSkeleton({ textarea = false }: { textarea?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton
        className={textarea ? "mt-1 h-64 w-full" : "mt-1 h-8 w-full"}
      />
      <Skeleton className="mt-1.5 h-3 w-3/4" />
    </div>
  );
}

export default function PostDetailLoading() {
  return (
    <SkeletonPage>
      <div className="flex flex-wrap items-start justify-between gap-3 pb-5">
        <div className="min-w-0">
          <Skeleton className="h-6 w-20" />
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-80 max-w-full" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="mt-1.5 h-3 w-64 max-w-full" />
        </div>
        <Skeleton className="size-8 shrink-0" />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="Conteúdo"
              description="Título interno, texto do post e tags de organização."
            />
            <CardBody className="flex flex-col gap-4">
              <FieldSkeleton />
              <FieldSkeleton textarea />
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="mt-1 h-8 w-full" />
                <div className="mt-2 flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-14" />
                </div>
              </div>
              <div>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-1 h-24 w-full rounded-ds-lg" />
              </div>
            </CardBody>
          </Card>

          <Card className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-1.5 rounded-full" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-32" />
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader
              title="Pré-visualização"
              description="Como o post aparecerá no LinkedIn."
            />
            <CardBody className="p-3">
              <div className="rounded-ds-lg border border-ds-line">
                <div className="flex items-start gap-2.5 p-3">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-1.5 h-3 w-4/5" />
                    <Skeleton className="mt-1 h-3 w-20" />
                  </div>
                </div>
                <div className="px-3 pb-3">
                  <SkeletonText lines={4} />
                </div>
                <Skeleton className="aspect-[1.91/1] w-full rounded-none" />
                <div className="flex items-center justify-between border-t border-ds-line px-3 py-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Publicação"
              description="Estratégia, score e próxima execução."
              action={<Skeleton className="h-5 w-16" />}
            />
            <CardBody className="flex flex-col gap-3">
              <Skeleton className="h-20 w-full rounded-ds-lg" />
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-8 w-full" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Detalhes" description="Metadados do post." />
            <CardBody>
              <div className="divide-y divide-ds-line">
                {Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
                  >
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>
    </SkeletonPage>
  );
}
