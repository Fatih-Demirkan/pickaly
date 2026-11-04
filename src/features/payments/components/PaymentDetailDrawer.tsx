import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { Drawer } from "@/components/ui/Drawer";
import { getAccountMap } from "@/features/accounts/server";
import { getCategoryMap } from "@/features/categories/server";
import { isLocale } from "@/i18n/config";
import { toDateKey } from "@/lib/dates";
import { paymentCloseHref, type PaymentOrigin } from "../routes";
import { getPaymentDetail } from "../server";
import { PaymentDetail } from "./PaymentDetail";

// Ödeme Detayı sunumu (RESPONSIVE §3.3.2): İşlem Detayı ile aynı kural — mobil tam ekran · 768–1279 sağ drawer
// 480 px · ≥1280 listenin sağında sabit panel. Kapatınca gelinen ekrana dönülür (Ana Sayfa veya İşlemler).

type PaymentDetailDrawerProps = { id: string; origin: PaymentOrigin };

export async function PaymentDetailDrawer({ id, origin }: PaymentDetailDrawerProps) {
  const data = await getPaymentDetail(id);
  if (!data) notFound();

  const [t, rawLocale, categories, accounts] = await Promise.all([getTranslations("payments.detail"), getLocale(), getCategoryMap(), getAccountMap()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const closeHref = paymentCloseHref(origin);
  const titleId = `payment-detail-${data.payment.id}`;

  return (
    <Drawer closeHref={closeHref} closeLabel={t("close")} labelledBy={titleId} size="detail" docked>
      <FocusHeader title={t("title")} titleId={titleId} back={{ href: closeHref, label: t("back") }} />
      <DrawerBody>
        <PaymentDetail
          data={data}
          category={categories.get(data.series.categoryId)}
          accounts={accounts}
          locale={locale}
          today={toDateKey(new Date())}
          origin={origin}
        />
      </DrawerBody>
    </Drawer>
  );
}
