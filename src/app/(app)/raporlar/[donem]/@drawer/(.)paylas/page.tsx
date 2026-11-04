import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ShareReportDialog } from "@/features/reports/components/ShareReportDialog";
import { isMonthKey } from "@/lib/dates";

// Rapordan açılan Paylaşılabilir Rapor (intercept). Doğrudan adres: ../../paylas/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reports.shareView");
  return { title: t("title") };
}

export default async function InterceptedShareReport({ params }: PageProps<"/raporlar/[donem]/paylas">) {
  await connection(); // Rapor istek anında hesaplanır (cacheComponents).
  const { donem } = await params;
  if (!isMonthKey(donem)) notFound();
  return <ShareReportDialog month={donem} />;
}
