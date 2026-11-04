import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { TransactionFormDrawer } from "@/features/transactions/components/TransactionFormDrawer";
import { TransactionsOverview } from "@/features/transactions/components/TransactionsOverview";
import { transactionRepository } from "@/features/transactions/server";
import { toMonthKey } from "@/lib/dates";

// İşlemi Düzenle — doğrudan adresle açılış. Arkada kaydın ayına ait liste çizilir. Detaydan açılış: @drawer/(.)[id]/duzenle.

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("transactions.form");
  return { title: t("editTitle") };
}

export default async function EditTransactionPage({ params }: PageProps<"/islemler/[id]/duzenle">) {
  // Tarihler ve örnek veri istek anındaki zamana göre hesaplanır: sayfa istek anında render edilir (cacheComponents).
  await connection();
  const { id } = await params;
  const transaction = await transactionRepository.get(decodeURIComponent(id));
  if (!transaction) notFound();

  return (
    <>
      <TransactionsOverview query={{ month: toMonthKey(new Date(transaction.occurredAt)) }} />
      <TransactionFormDrawer mode="edit" id={transaction.id} />
    </>
  );
}
