import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { TransactionFormDrawer } from "@/features/transactions/components/TransactionFormDrawer";

// Detaydan açılan İşlemi Düzenle (intercept). Doğrudan adres: ../../../[id]/duzenle/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("transactions.form");
  return { title: t("editTitle") };
}

export default async function InterceptedEditTransaction({ params }: PageProps<"/islemler/[id]/duzenle">) {
  await connection(); // Tarihler istek anına göre hesaplanır (cacheComponents).
  const { id } = await params;
  return <TransactionFormDrawer mode="edit" id={decodeURIComponent(id)} />;
}
