import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { LoanFormDrawer } from "@/features/loans/components/LoanFormDrawer";

// Listeden açılan Borç Ver (intercept). Doğrudan adres: ../../yeni/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans.form");
  return { title: t("newTitle") };
}

export default async function InterceptedNewLoan() {
  await connection();
  return <LoanFormDrawer mode="create" />;
}
