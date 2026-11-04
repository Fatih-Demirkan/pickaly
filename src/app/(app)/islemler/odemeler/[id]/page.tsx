import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PaymentDetailDrawer } from "@/features/payments/components/PaymentDetailDrawer";
import { parsePaymentOrigin } from "@/features/payments/routes";
import { getPaymentDetail } from "@/features/payments/server";
import { TransactionsOverview } from "@/features/transactions/components/TransactionsOverview";
import { toMonthKey } from "@/lib/dates";

// Ödeme Detayı — doğrudan adresle ve diğer ekranlardan (Ana Sayfa "Yaklaşan Ödemeler") açılış.
// Arkada bu ayın İşlemler listesi çizilir; detay İşlem Detayı ile aynı drawer'dadır. İşlemler'den açılış: @drawer/(.)odemeler/[id].

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("payments.detail");
  return { title: t("title") };
}

export default async function PaymentDetailPage({ params, searchParams }: PageProps<"/islemler/odemeler/[id]">) {
  // Vadeler ve örnek veri istek anındaki zamana göre hesaplanır: sayfa istek anında render edilir (cacheComponents).
  await connection();
  const [{ id }, { kaynak }] = await Promise.all([params, searchParams]);
  // Silinmiş veya hiç olmayan ödeme: liste çizilmeden önce 404 (İşlem Detayı ile aynı).
  const data = await getPaymentDetail(decodeURIComponent(id));
  if (!data) notFound();

  return (
    <>
      <TransactionsOverview query={{ month: toMonthKey(new Date()) }} />
      <PaymentDetailDrawer id={data.payment.id} origin={parsePaymentOrigin(kaynak)} />
    </>
  );
}
