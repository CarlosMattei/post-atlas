import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { Button, ButtonLink } from "@/app/components/button";
import {
  ConnectionIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  RefreshIcon,
  SendIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/app/components/icons";
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DetailList,
  IntegrationBadge,
  PageContainer,
  PageHeader,
} from "@/app/components/ui";
import { integrations } from "@/app/lib/data";
import { formatTime } from "@/app/lib/format";
import type { Integration } from "@/app/lib/types";

export const metadata: Metadata = {
  title: "Conexão · Post Atlas",
};

const integrationIcons: Record<
  Integration["id"],
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  linkedin: ExternalLinkIcon,
  n8n: ConnectionIcon,
  openrouter: SparklesIcon,
  telegram: SendIcon,
  postgres: DatabaseIcon,
};

export default function ConnectionPage() {
  const connected = integrations.filter(
    (integration) => integration.status === "conectado",
  ).length;
  const attention = integrations.filter(
    (integration) => integration.status === "atencao",
  ).length;

  return (
    <PageContainer>
      <PageHeader
        title="Conexão"
        description="Estado das integrações que sustentam a publicação, o score e os alertas."
        actions={
          <Button variant="outline">
            <RefreshIcon className="size-4" />
            Verificar conexões
          </Button>
        }
      />

      <Alert
        tone="warning"
        title="O webhook de score ainda não tem autenticação"
        action={
          <ButtonLink href="/configuracoes" variant="standard" size="sm">
            Configurar segredo
          </ButtonLink>
        }
      >
        O TDD recomenda validar o cabeçalho X-Webhook-Secret no início do
        fluxo. Até lá, restrinja o acesso pela rede local ou Tailscale.
      </Alert>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-ds-lg border border-ds-line bg-ds-surface px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ds-text">
            {connected} de {integrations.length} integrações conectadas
          </p>
          <p className="text-xs text-ds-text-subtle">
            {attention > 0
              ? `${attention} integração precisa de atenção`
              : "Nenhuma ação necessária"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="success">{connected} conectadas</Badge>
          {attention > 0 ? (
            <Badge tone="warning">{attention} com atenção</Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integrationIcons[integration.id];

          return (
            <Card key={integration.id} className="flex flex-col">
              <div className="flex items-start gap-3 p-4 pb-3">
                <span
                  className={
                    integration.id === "linkedin"
                      ? "flex size-9 shrink-0 items-center justify-center rounded-ds bg-ds-info-bg text-sm font-bold text-ds-info-text"
                      : "flex size-9 shrink-0 items-center justify-center rounded-ds bg-ds-surface-hover text-ds-text-subtle"
                  }
                >
                  {integration.id === "linkedin" ? "in" : <Icon className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-ds-text">
                      {integration.name}
                    </h2>
                    <IntegrationBadge status={integration.status} />
                  </div>
                  <p className="mt-0.5 text-xs leading-4 text-ds-text-subtle">
                    {integration.description}
                  </p>
                </div>
              </div>

              <CardBody className="flex-1 pt-0">
                <DetailList items={integration.details} />
              </CardBody>

              <CardFooter>
                <span className="text-[11px] text-ds-text-subtle">
                  Verificado hoje, {formatTime(integration.lastCheckedAt)}
                </span>
                <Button variant="outline" size="sm">
                  {integration.actionLabel}
                  {integration.id === "n8n" ? (
                    <ExternalLinkIcon className="size-3.5" />
                  ) : null}
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        <Card className="flex flex-col lg:col-span-2">
          <CardHeader
            title="Segurança e acesso"
            description="Itens pendentes na arquitetura do TDD antes de expor o front-end."
            action={<Badge tone="warning">2 pendências</Badge>}
          />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-ds-lg border border-ds-line p-3">
              <div className="flex items-center gap-2">
                <ShieldIcon className="size-4 text-ds-warning-text" />
                <h3 className="text-sm font-semibold text-ds-text">
                  Autenticação do webhook
                </h3>
              </div>
              <p className="mt-1 text-xs leading-5 text-ds-text-subtle">
                Incluir X-Webhook-Secret no POST de score e validar no primeiro
                nó do workflow. Hoje o endpoint aceita chamadas sem segredo.
              </p>
            </div>

            <div className="rounded-ds-lg border border-ds-line p-3">
              <div className="flex items-center gap-2">
                <DatabaseIcon className="size-4 text-ds-warning-text" />
                <h3 className="text-sm font-semibold text-ds-text">
                  Acesso do front-end ao Postgres
                </h3>
              </div>
              <p className="mt-1 text-xs leading-5 text-ds-text-subtle">
                O Umbrel não oferece RLS integrado ao login. As opções em
                avaliação são webhooks autenticados, API própria ou PostgREST na
                rede local.
              </p>
            </div>
          </CardBody>
          <CardFooter>
            <span className="text-xs text-ds-text-subtle">
              Referências: TDD v1.1, seções 2.4 e 8.
            </span>
            <ButtonLink href="/configuracoes" variant="subtle" size="sm">
              Abrir configurações
            </ButtonLink>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
