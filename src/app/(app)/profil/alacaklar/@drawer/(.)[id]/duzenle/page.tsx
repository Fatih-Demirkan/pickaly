import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { LoanFormDrawer } from "@/features/loans/components/LoanFormDrawer";

// Listeden / detaydan açılan Alacağı Düzenle (intercept). Doğrudan adres: ../../../[id]/duzenle/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans.form");
  return { title: t("editTitle") };
}

export default async function InterceptedEditLoan({ params }: PageProps<"/profil/alacaklar/[id]/duzenle">) {
  await connection();
  const { id } = await params;
  return <LoanFormDrawer mode="edit" id={decodeURIComponent(id)} />;
}
