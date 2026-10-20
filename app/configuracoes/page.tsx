import type { Metadata } from "next";
import { ButtonLink } from "@/app/components/button";
import { SettingsForm } from "@/app/components/settings-form";
import { ConnectionIcon } from "@/app/components/icons";
import { PageContainer, PageHeader } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Configurações · Post Atlas",
};

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Configurações"
        description="Controle a rotina de publicação, os alertas e os segredos das integrações."
        actions={
          <ButtonLink href="/conexao" variant="outline">
            <ConnectionIcon className="size-4" />
            Ver conexões
          </ButtonLink>
        }
      />
      <SettingsForm />
    </PageContainer>
  );
}
