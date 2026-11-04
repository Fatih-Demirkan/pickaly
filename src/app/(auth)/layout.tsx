import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ToastProvider } from "@/components/ui/Toast";
import { isSupabaseConfigured } from "@/lib/env";

// Oturum ekranları (Giriş, Kayıt, E-posta Doğrulama, Şifremi Unuttum) — RESPONSIVE §8.2.8 [Varsayım: Figma'da yok].
//   mobil: tam sayfa, tek sütun, sayfa padding 16 · tablet+: Neutral/50 zeminde ortalı kart (max 440 px, radius-2xl,
//   Shadow/Card). Navigasyon yok (oturumsuz). Üstte Header'daki marka bloğu: "Pickaly" (H1) + "Life & Money Planner".
// Supabase tanımlı değilse kartın üstünde kurulum notu gösterilir; uygulama bu durumda oturumsuz açılır.
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const [t, tCommon] = await Promise.all([getTranslations(), getTranslations("common")]);
  const configured = isSupabaseConfigured();

  return (
    <ToastProvider dismissLabel={tCommon("dismissNotification")}>
      <main className="flex min-h-dvh flex-col bg-surface-card tablet:items-center tablet:justify-center tablet:bg-surface-page tablet:px-24 tablet:py-48">
        <div className="flex w-full flex-1 flex-col gap-24 px-16 pt-48 pb-32 animate-page-enter tablet:max-w-[440px] tablet:flex-none tablet:rounded-2xl tablet:border tablet:border-border-default tablet:bg-surface-card tablet:p-32 tablet:shadow-card">
          <div className="flex flex-col">
            <span className="text-heading-h1 text-text-primary">{t("header.brand")}</span>
            <span className="text-body-sm text-text-secondary">{t("header.tagline")}</span>
          </div>
          {!configured && (
            <p role="note" className="rounded-md bg-status-warning-subtle p-12 text-body-sm text-text-on-warning">
              {t("auth.notConfigured")}
            </p>
          )}
          {children}
        </div>
      </main>
    </ToastProvider>
  );
}
