import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { TransactionFormDrawer } from "@/features/transactions/components/TransactionFormDrawer";
import { parseEntryParam } from "@/features/transactions/routes";

// Uygulama içinden (hangi ekrandan olursa olsun) açılan Yeni İşlem: bulunulan ekranın üstünde bottom sheet (intercept).
// Doğrudan adres (yenileme, paylaşılan bağlantı): src/app/(app)/islemler/yeni/page.tsx.
// Slot'un yükleme sınırı yok; istek anı verisi kendi Suspense sınırında okunur (cacheComponents). Arkadaki ekran
// beklerken değişmez, sheet veri gelince alttan kayarak açılır.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("transactions.form");
  return { title: t("newTitle") };
}

async function NewTransactionSheet({ searchParams }: Pick<PageProps<"/islemler/yeni">, "searchParams">) {
  await connection(); // Tarihler istek anına göre hesaplanır (cacheComponents).
  const { tur } = await searchParams;
  return <TransactionFormDrawer mode="create" type={parseEntryParam(tur)} intercepted />;
}

export default function InterceptedNewTransaction({ searchParams }: PageProps<"/islemler/yeni">) {
  return (
    <Suspense fallback={null}>
      <NewTransactionSheet searchParams={searchParams} />
    </Suspense>
  );
}
