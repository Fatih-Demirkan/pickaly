import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MonthlyReport } from "@/features/reports/components/MonthlyReport";
import { isMonthKey } from "@/lib/dates";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reports");
  return { title: t("title") };
}

export default async function MonthlyReportPage({ params }: PageProps<"/raporlar/[donem]">) {
  await connection(); // Rapor gerçekleşmiş işlemlerden istek anında hesaplanır (cacheComponents).
  const { donem } = await params;
  if (!isMonthKey(donem)) notFound();
  return <MonthlyReport month={donem} />;
}
