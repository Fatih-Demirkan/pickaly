import { getTranslations } from "next-intl/server";

// Rota yüklenirken gösterilen genel durum. Modüller kendi iskelet (skeleton) yüklemelerini ekleyecek (DESIGN §9.3).
export default async function Loading() {
  const t = await getTranslations("common");

  return (
    <div role="status" aria-live="polite" className="flex min-h-dvh items-center justify-center bg-surface-page">
      <span className="size-24 animate-spin rounded-full border-2 border-border-default border-t-brand-primary" aria-hidden />
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}
