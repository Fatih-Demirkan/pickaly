import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { TransactionFormDrawer } from "@/features/transactions/components/TransactionFormDrawer";
import { parseFormTypeParam } from "@/features/transactions/routes";

// İşlemler'den açılan Yeni İşlem (intercept). Doğrudan adres ve diğer sekmelerden gelişler: ../../yeni/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("transactions.form");
  return { title: t("newTitle") };
}

export default async function InterceptedNewTransaction({ searchParams }: PageProps<"/islemler/yeni">) {
  await connection(); // Tarihler istek anına göre hesaplanır (cacheComponents).
  const { tur } = await searchParams;
  return <TransactionFormDrawer mode="create" type={parseFormTypeParam(tur)} />;
}
