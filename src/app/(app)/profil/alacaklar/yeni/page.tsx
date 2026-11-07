import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { LoanFormDrawer } from "@/features/loans/components/LoanFormDrawer";
import { LoanList } from "@/features/loans/components/LoanList";

// Borç Ver — doğrudan adresle açılış; arkada Alacaklarım çizilir. Listeden açılış: @drawer/(.)yeni.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans.form");
  return { title: t("newTitle") };
}

export default async function NewLoanPage() {
  await connection();
  return (
    <>
      <LoanList />
      <LoanFormDrawer mode="create" />
    </>
  );
}
