import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { TransactionFormDrawer } from "@/features/transactions/components/TransactionFormDrawer";
import { TransactionsOverview } from "@/features/transactions/components/TransactionsOverview";
import { parseEntryParam } from "@/features/transactions/routes";
import { toMonthKey } from "@/lib/dates";

// Yeni İşlem — doğrudan adresle açılış (yenileme, paylaşılan bağlantı). Arkada bu ayın listesi çizilir.
// ?tur=gelir|gider|gorev|abonelik seçili sekmeyi belirler; varsayılan Gelir (RESPONSIVE §3.3.3). Uygulama içinden açılış: (app)/@sheet/(.)islemler/yeni (bulunulan ekranın üstünde).

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("transactions.form");
  return { title: t("newTitle") };
}

export default async function NewTransactionPage({ searchParams }: PageProps<"/islemler/yeni">) {
  // Tarihler ve örnek veri istek anındaki zamana göre hesaplanır: sayfa istek anında render edilir (cacheComponents).
  await connection();
  const { tur } = await searchParams;

  return (
    <>
      <TransactionsOverview query={{ month: toMonthKey(new Date()) }} />
      <TransactionFormDrawer mode="create" type={parseEntryParam(tur)} />
    </>
  );
}
