import type { Metadata } from "next";
import { Button, ButtonLink } from "@/app/components/button";
import { LogoutIcon, ShieldIcon } from "@/app/components/icons";
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  DetailList,
  PageContainer,
} from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Sair · Post Atlas",
};

export default function LogoutPage() {
  return (
    <PageContainer className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardBody className="px-6 py-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-ds-info-bg text-ds-info-text">
            <LogoutIcon className="size-6" />
          </span>
          <h1 className="mt-4 text-xl font-semibold leading-6 text-ds-text">
            Encerrar sessão
          </h1>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-ds-text-subtle">
            Você está saindo do Post Atlas. A automação continua rodando no
            servidor enquanto a sessão estiver encerrada.
          </p>

          <div className="mt-5 rounded-ds-lg border border-ds-line p-3 text-left">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ds-text">
                <ShieldIcon className="size-3.5" />
                Sessão do administrador
              </span>
              <Badge tone="warning">Auth pendente</Badge>
            </div>
            <div className="mt-2">
              <DetailList
                items={[
                  { label: "Usuário", value: "Carlos Mattei" },
                  { label: "Perfil", value: "Administrador único" },
                  { label: "Sessão", value: "Local · este navegador" },
                ]}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="danger">
              <LogoutIcon className="size-4" />
              Sair da conta
            </Button>
            <ButtonLink href="/" variant="outline">
              Voltar ao início
            </ButtonLink>
          </div>
        </CardBody>
        <CardFooter className="justify-center">
          <p className="text-[11px] leading-4 text-ds-text-subtle">
            O mecanismo de autenticação será definido na arquitetura do
            front-end — TDD, seção 2.4.
          </p>
        </CardFooter>
      </Card>
    </PageContainer>
  );
}
