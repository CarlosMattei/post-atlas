import {
  Skeleton,
  SkeletonPage,
  SkeletonPageHeader,
} from "@/app/components/skeletons";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@/app/components/ui";

function SettingFieldSkeleton({ hint = true }: { hint?: boolean }) {
  return (
    <div>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-1 h-8 w-full" />
      {hint ? <Skeleton className="mt-1.5 h-3 w-4/5" /> : null}
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actions={1} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="Rotina de publicação"
              description="Horário, dias e fuso usados pela fila de posts."
              action={<Skeleton className="h-5 w-16" />}
            />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <SettingFieldSkeleton />
              <SettingFieldSkeleton />
              <div className="sm:col-span-2">
                <Skeleton className="h-3 w-24" />
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {Array.from({ length: 7 }, (_, index) => (
                    <Skeleton key={index} className="h-9 w-11" />
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <Skeleton className="h-14 w-full rounded-ds-lg" />
              </div>
            </CardBody>
            <CardFooter>
              <Skeleton className="h-3 w-full max-w-lg" />
            </CardFooter>
          </Card>

          <Card>
            <CardHeader
              title="Fila e alertas"
              description="Limites que disparam avisos no Telegram."
              action={<Skeleton className="h-5 w-20" />}
            />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <SettingFieldSkeleton />
              <Skeleton className="h-24 w-full rounded-ds-lg" />
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader
              title="Segurança"
              description="Segredos usados pelos webhooks do n8n."
              action={<Skeleton className="h-5 w-20" />}
            />
            <CardBody className="flex flex-col gap-4">
              <SettingFieldSkeleton />
              <SettingFieldSkeleton hint={false} />
              <Skeleton className="h-14 w-full rounded-ds-lg" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="LinkedIn"
              description="Token e escopos da publicação."
              action={<Skeleton className="h-5 w-24" />}
            />
            <CardBody>
              <div className="divide-y divide-ds-line">
                {Array.from({ length: 4 }, (_, index) => (
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
            <CardFooter>
              <Skeleton className="h-4 w-24" />
            </CardFooter>
          </Card>
        </div>
      </div>

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 shrink-0" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </Card>
    </SkeletonPage>
  );
}
