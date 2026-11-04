import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ToastProvider } from "@/components/ui/Toast";
import { isSupabaseConfigured } from "@/lib/env";

// Oturum ekranları (Giriş, Kayıt, E-posta Doğrulama, Şifremi Unuttum) — RESPONSIVE §8.2.8 [Varsayım: Figma'da yok].
//   Görünüm DESIGN_SYSTEM_PICKALY §5.1–§5.7: mobil canvas zeminde tam sayfa, tek sütun, sayfa padding 16 ·
//   tablet+: canvas zeminde ortalı beyaz kart (max 440 px, radius-xl, padding 32, elev-2). Navigasyon yok (oturumsuz).
//   Üstte marka bloğu: 28 px blue.500 logo karosu + "Pickaly" title-md + "Life & Money Planner" caption.
// Supabase tanımlı değilse kartın üstünde kurulum notu gösterilir; uygulama bu durumda oturumsuz açılır.
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const [t, tCommon] = await Promise.all([getTranslations(), getTranslations("common")]);
  const configured = isSupabaseConfigured();

  return (
    <ToastProvider dismissLabel={tCommon("dismissNotification")}>
      <main className="flex min-h-dvh flex-col bg-surface-page tablet:items-center tablet:justify-center tablet:px-24 tablet:py-48">
        <div className="flex w-full flex-1 flex-col gap-24 px-16 pt-48 pb-32 animate-page-enter tablet:max-w-[440px] tablet:flex-none tablet:rounded-xl tablet:bg-surface-card tablet:p-32 tablet:shadow-elev-2">
          <div className="flex items-center gap-12">
            <span aria-hidden className="size-28 shrink-0 rounded-sm bg-brand-accent" />
            <div className="flex flex-col">
              <span className="text-title-md text-text-primary">{t("header.brand")}</span>
              <span className="text-caption text-text-secondary">{t("header.tagline")}</span>
            </div>
          </div>
          {!configured && (
            <p role="note" className="rounded-lg bg-status-warning-subtle p-16 text-caption text-text-primary">
              {t("auth.notConfigured")}
            </p>
          )}
          {children}
        </div>
      </main>
    </ToastProvider>
  );
}
