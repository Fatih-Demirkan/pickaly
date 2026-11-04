import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { PaymentDetailDrawer } from "@/features/payments/components/PaymentDetailDrawer";
import { parsePaymentOrigin } from "@/features/payments/routes";

// İşlemler'den açılan Ödeme Detayı (intercept). Doğrudan adres ve Ana Sayfa'dan açılış: ../../../odemeler/[id]/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("payments.detail");
  return { title: t("title") };
}

export default async function InterceptedPaymentDetail({ params, searchParams }: PageProps<"/islemler/odemeler/[id]">) {
  await connection(); // Vadeler istek anına göre hesaplanır (cacheComponents).
  const [{ id }, { kaynak }] = await Promise.all([params, searchParams]);
  return <PaymentDetailDrawer id={decodeURIComponent(id)} origin={parsePaymentOrigin(kaynak)} />;
}
