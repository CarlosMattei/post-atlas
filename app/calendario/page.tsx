import type { Metadata } from "next";
import { ButtonLink } from "@/app/components/button";
import { CalendarIcon, PlusIcon } from "@/app/components/icons";
import { MonthCalendar } from "@/app/components/month-calendar";
import { PageContainer, PageHeader } from "@/app/components/ui";
import { getCalendarData } from "@/app/lib/queries";

export const metadata: Metadata = {
  title: "Calendário · Post Atlas",
};

export default async function CalendarPage() {
  const { posts, scheduleConfig } = await getCalendarData();

  return (
    <PageContainer>
      <PageHeader
        title="Calendário"
        description="Arraste os cartões entre os dias para mudar a data de publicação ou selecione um post e escolha o novo dia."
        actions={
          <>
            <ButtonLink href="/configuracoes" variant="outline">
              <CalendarIcon className="size-4" />
              Configurar rotina
            </ButtonLink>
            <ButtonLink href="/posts/novo" variant="primary">
              <PlusIcon className="size-4" />
              Novo post
            </ButtonLink>
          </>
        }
      />

      <MonthCalendar posts={posts} scheduleConfig={scheduleConfig} />
    </PageContainer>
  );
}
