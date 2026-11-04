import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MonthlyReport } from "@/features/reports/components/MonthlyReport";
import { ShareReportDialog } from "@/features/reports/components/ShareReportDialog";
import { isMonthKey } from "@/lib/dates";

// Paylaşılabilir Rapor — doğrudan adresle açılış; arkada Aylık Finans Raporu çizilir. Rapordan açılış: @drawer/(.)paylas.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reports.shareView");
  return { title: t("title") };
}

export default async function ShareReportPage({ params }: PageProps<"/raporlar/[donem]/paylas">) {
  await connection(); // Rapor istek anında hesaplanır (cacheComponents).
  const { donem } = await params;
  if (!isMonthKey(donem)) notFound();
  return (
    <>
      <MonthlyReport month={donem} />
      <ShareReportDialog month={donem} />
    </>
  );
}
