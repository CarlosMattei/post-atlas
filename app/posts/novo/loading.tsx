import {
  Skeleton,
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonText,
} from "@/app/components/skeletons";
import {
  Card,
  CardBody,
  CardFooter,
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
        className={textarea ? "mt-1 h-48 w-full" : "mt-1 h-8 w-full"}
      />
      <Skeleton className="mt-1.5 h-3 w-3/4" />
    </div>
  );
}

export default function NewPostLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actions={1} />

      <Skeleton className="h-16 w-full rounded-ds-lg" />

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="Conteúdo"
              description="Título interno, texto do post e tags de organização."
            />
            <CardBody className="flex flex-col gap-4">
              <FieldSkeleton />
              <FieldSkeleton textarea />
              <FieldSkeleton />
              <div>
                <Skeleton className="h-3 w-16" />
                <div className="mt-1 flex gap-1">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Quando publicar"
              description="A escolha define se o post disputa a fila ou tem horário próprio."
            />
            <CardBody>
              <div className="grid gap-2 sm:grid-cols-2">
                <Skeleton className="h-20 w-full rounded-ds-lg" />
                <Skeleton className="h-20 w-full rounded-ds-lg" />
              </div>
              <div className="mt-3 max-w-xs">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-1 h-8 w-full" />
                <Skeleton className="mt-1.5 h-3 w-40" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Score por IA"
              description="Avaliação de 0 a 100 baseada apenas no texto."
              action={<Skeleton className="h-5 w-20" />}
            />
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Skeleton className="size-8 shrink-0" />
                <div>
                  <Skeleton className="h-4 w-48 max-w-full" />
                  <Skeleton className="mt-1.5 h-3 w-64 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-28" />
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader
              title="Pré-visualização"
              description="Como o post aparecerá no LinkedIn."
              action={<Skeleton className="h-5 w-16" />}
            />
            <CardBody>
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
                  <SkeletonText lines={3} />
                </div>
                <Skeleton className="aspect-[1.91/1] w-full rounded-none" />
                <div className="flex gap-1 px-3 pt-2.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-ds-line px-3 py-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Checklist antes de aprovar" />
            <CardBody>
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </CardBody>
            <CardFooter>
              <Skeleton className="h-3 w-24" />
            </CardFooter>
          </Card>
        </div>
      </div>

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Skeleton className="h-3 w-full max-w-xl" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
        </div>
      </Card>
    </SkeletonPage>
  );
}
