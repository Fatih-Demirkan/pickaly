import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { PageContainer } from "./PageContainer";
import { PageHeader } from "./PageHeader";

type PageKey = "calendar" | "transactions" | "savings" | "profile";

/**
 * GEÇİCİ: Henüz geliştirilmemiş sekmeler için başlık + bilgi kartı.
 * Başlık ve alt başlık Pages'taki ekran başlıklarından alınmıştır; modül geliştirilince kaldırılır.
 */
export async function ModulePlaceholder({ page, children }: { page: PageKey; children?: ReactNode }) {
  const t = await getTranslations();

  return (
    <PageContainer className="flex flex-col gap-(--layout-section-gap)">
      <PageHeader title={t(`pages.${page}.title`)} subtitle={t(`pages.${page}.subtitle`)} />
      <Card>
        <p className="text-body text-text-secondary">{t("placeholder.body")}</p>
      </Card>
      {children}
    </PageContainer>
  );
}
