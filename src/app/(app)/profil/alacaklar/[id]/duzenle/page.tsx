import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { LoanFormDrawer } from "@/features/loans/components/LoanFormDrawer";
import { LoanList } from "@/features/loans/components/LoanList";

// Alacağı Düzenle — doğrudan adresle açılış; arkada Alacaklarım çizilir. Listeden: @drawer/(.)[id]/duzenle.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans.form");
  return { title: t("editTitle") };
}

export default async function EditLoanPage({ params }: PageProps<"/profil/alacaklar/[id]/duzenle">) {
  await connection();
  const { id } = await params;
  return (
    <>
      <LoanList />
      <LoanFormDrawer mode="edit" id={decodeURIComponent(id)} />
    </>
  );
}
