import {
  Skeleton,
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonText,
} from "@/app/components/skeletons";
import {
  Card,
  CardBody,
  CardHeader,
} from "@/app/components/ui";

export default function TrendDetailLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actions={1} />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Tema coletado"
            description="Carregando dados da coleta…"
            action={<Skeleton className="h-5 w-16" />}
          />
          <CardBody>
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="mt-1.5 h-7 w-3/5" />
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="mt-6 h-11 w-44" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Dados da coleta"
            description="Métricas registradas pela busca."
          />
          <CardBody>
            <div className="divide-y divide-ds-line">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader
            title="Sobre este item"
            description="Como interpretar os dados exibidos."
          />
          <CardBody className="flex items-start gap-3">
            <Skeleton className="size-9 shrink-0" />
            <SkeletonText lines={2} className="w-full max-w-2xl" />
          </CardBody>
        </Card>
      </div>
    </SkeletonPage>
  );
}
