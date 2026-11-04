import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { SavingsFormDrawer } from "@/features/savings/components/SavingsFormDrawer";

// Detaydan açılan Hesabı Düzenle (intercept). Doğrudan adres: ../../../[id]/duzenle/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("savings.form");
  return { title: t("editTitle") };
}

export default async function InterceptedEditSavings({ params }: PageProps<"/birikimler/[id]/duzenle">) {
  await connection(); // Tarihler istek anına göre hesaplanır (cacheComponents).
  const { id } = await params;
  return <SavingsFormDrawer mode="edit" id={decodeURIComponent(id)} />;
}
