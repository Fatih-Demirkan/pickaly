import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { LoanDetailDrawer } from "@/features/loans/components/LoanDetailDrawer";

// Listeden açılan Alacak Detayı (intercept). Doğrudan adres: ../../[id]/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans.detail");
  return { title: t("title") };
}

export default async function InterceptedLoanDetail({ params }: PageProps<"/profil/alacaklar/[id]">) {
  await connection();
  const { id } = await params;
  return <LoanDetailDrawer id={decodeURIComponent(id)} />;
}
