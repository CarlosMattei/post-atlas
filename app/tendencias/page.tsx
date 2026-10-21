import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/app/components/ui";
import { TrendItemsList } from "@/app/components/trend-items-list";
import { getTrendItems } from "@/app/lib/queries";

export const metadata: Metadata = {
  title: "Tendências · Post Atlas",
};

export const instant = false;

export default async function TrendsPage() {
  const trendItems = await getTrendItems();

  return (
    <PageContainer>
      <PageHeader
        title="Tendências"
        description="Explore os temas coletados e encontre assuntos relevantes para seus próximos posts."
      />
      <TrendItemsList items={trendItems} />    </PageContainer>
  );
}
