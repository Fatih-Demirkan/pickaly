import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { TransactionDetailDrawer } from "@/features/transactions/components/TransactionDetailDrawer";
import { parseListQuery } from "@/features/transactions/routes";

// Listeden açılan İşlem Detayı (intercept). Doğrudan adres: ../../[id]/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("transactions.detail");
  return { title: t("title") };
}

export default async function InterceptedTransactionDetail({ params, searchParams }: PageProps<"/islemler/[id]">) {
  await connection(); // Tarihler istek anına göre hesaplanır (cacheComponents).
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <TransactionDetailDrawer id={decodeURIComponent(id)} query={parseListQuery(query)} />;
}
