import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { LoanDetailDrawer } from "@/features/loans/components/LoanDetailDrawer";
import { LoanList } from "@/features/loans/components/LoanList";

// Alacak Detayı — doğrudan adresle açılış (ör. Takvim'den); arkada Alacaklarım çizilir. Listeden: @drawer/(.)[id].
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans.detail");
  return { title: t("title") };
}

export default async function LoanDetailPage({ params }: PageProps<"/profil/alacaklar/[id]">) {
  await connection();
  const { id } = await params;
  return (
    <>
      <LoanList />
      <LoanDetailDrawer id={decodeURIComponent(id)} />
    </>
  );
}
