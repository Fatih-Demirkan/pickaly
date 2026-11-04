import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { TransactionDetailDrawer } from "@/features/transactions/components/TransactionDetailDrawer";
import { TransactionsOverview } from "@/features/transactions/components/TransactionsOverview";
import { parseListQuery } from "@/features/transactions/routes";
import { transactionRepository } from "@/features/transactions/server";
import { toMonthKey } from "@/lib/dates";

// İşlem Detayı — doğrudan adresle açılış (yenileme, paylaşılan bağlantı). Liste, gelinen ay ve filtrelerle
// arkada çizilir; detay listeden açılışla aynı drawer'dadır. Listeden açılış: @drawer/(.)[id].

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("transactions.detail");
  return { title: t("title") };
}

export default async function TransactionDetailPage({ params, searchParams }: PageProps<"/islemler/[id]">) {
  // Tarihler ve örnek veri istek anındaki zamana göre hesaplanır: sayfa istek anında render edilir (cacheComponents).
  await connection();
  const [{ id }, rawQuery] = await Promise.all([params, searchParams]);
  const transaction = await transactionRepository.get(decodeURIComponent(id));
  if (!transaction) notFound();

  const query = parseListQuery(rawQuery);
  const month = query.month ?? toMonthKey(new Date(transaction.occurredAt));

  return (
    <>
      <TransactionsOverview query={{ ...query, month }} />
      <TransactionDetailDrawer id={transaction.id} query={{ ...query, month }} />
    </>
  );
}
