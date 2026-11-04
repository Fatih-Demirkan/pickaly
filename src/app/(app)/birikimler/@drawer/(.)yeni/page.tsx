import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { SavingsFormDrawer } from "@/features/savings/components/SavingsFormDrawer";

// Listeden açılan Yeni Birikim Hesabı (intercept). Doğrudan adres: ../../yeni/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("savings.form");
  return { title: t("newTitle") };
}

export default async function InterceptedNewSavings() {
  await connection(); // Tarihler istek anına göre hesaplanır (cacheComponents).
  return <SavingsFormDrawer mode="create" />;
}
