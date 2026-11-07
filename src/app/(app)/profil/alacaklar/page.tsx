import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { LoanList } from "@/features/loans/components/LoanList";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans");
  return { title: t("title") };
}

export default async function LoansPage() {
  await connection(); // Gecikme durumu istek anındaki güne göre hesaplanır (cacheComponents).
  return <LoanList />;
}
