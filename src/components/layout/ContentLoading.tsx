import { getTranslations } from "next-intl/server";

// İçerik alanı yüklenirken gösterilen durum. Navigasyon ve üst bar yerinde kalır; yalnızca sayfa içeriği bekler
// (Next "instant navigation": dinamik sayfa, paylaşılan layout'un altında kendi Suspense sınırına sahip olur).
// [Eksik] Modül iskeletleri (skeleton) tasarlanmadı (DESIGN §9.3).
export async function ContentLoading() {
  const t = await getTranslations("common");

  return (
    <div role="status" aria-live="polite" className="flex min-h-320 items-center justify-center">
      <span className="size-24 animate-spin rounded-full border-2 border-border-default border-t-brand-primary" aria-hidden />
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}
