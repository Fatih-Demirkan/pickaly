import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import { ToastProvider } from "@/components/ui/Toast";
import { isSupabaseConfigured } from "@/lib/env";

// Oturum ekranları (Giriş, Kayıt, E-posta Doğrulama, Şifremi Unuttum) — yeniden tasarım (ürün sahibi isteği 2026-11-05,
// "karşılama + form" yönü). [Türetme] DESIGN_SYSTEM_PICKALY §3 tipografi, §5.2 kart dili; DS Balance header'ın sade,
// büyük tipografisi:
//   Karşılama: 48 px blue.500 logo karosu + "Pickaly" title-md · display-hero slogan · body açıklama ·
//     üç kısa özellik satırı (36 px ikon karosu + body-strong). Mobilde formun üstünde, kısaltılmış (özellikler gizli).
//   Form kartı: beyaz, radius-xl, padding 24 (tablet+ 32), elev-2; içinde sayfa başlığı (title-md) + form.
//   Mobil: canvas zemin, tek sütun · laptop+: iki sütun — solda karşılama, sağda kart (max 440).
// Navigasyon yok (oturumsuz). Supabase tanımlı değilse kartın üstünde kurulum notu gösterilir.

const FEATURES: { key: "money" | "plan" | "savings"; icon: AppIconName }[] = [
  { key: "money", icon: "transactions" },
  { key: "plan", icon: "calendar" },
  { key: "savings", icon: "savings" },
];

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const [t, tCommon, tWelcome] = await Promise.all([getTranslations(), getTranslations("common"), getTranslations("auth.welcome")]);
  const configured = isSupabaseConfigured();

  return (
    <ToastProvider dismissLabel={tCommon("dismissNotification")}>
      <main className="flex min-h-dvh flex-col bg-surface-page">
        <div className="mx-auto flex w-full max-w-[1040px] flex-1 animate-page-enter flex-col gap-24 px-16 pt-40 pb-32 tablet:px-24 tablet:pt-64 laptop:grid laptop:grid-cols-2 laptop:items-center laptop:gap-64 laptop:px-40 laptop:py-48">
          <section aria-labelledby="auth-welcome" className="flex flex-col gap-16 tablet:mx-auto tablet:w-full tablet:max-w-[440px] laptop:mx-0 laptop:max-w-none">
            <div className="flex items-center gap-12">
              <span aria-hidden className="size-48 shrink-0 rounded-md bg-brand-accent" />
              <div className="flex flex-col">
                <span className="text-title-md text-text-primary">{t("header.brand")}</span>
                <span className="text-caption text-text-secondary">{t("header.tagline")}</span>
              </div>
            </div>
            <h1 id="auth-welcome" className="text-display-hero text-text-primary">
              {tWelcome("title")}
            </h1>
            <p className="text-body text-text-secondary">{tWelcome("body")}</p>
            <ul className="hidden flex-col gap-12 pt-8 laptop:flex">
              {FEATURES.map((feature) => (
                <li key={feature.key} className="flex items-center gap-12">
                  <span aria-hidden className="inline-flex size-36 shrink-0 items-center justify-center rounded-sm bg-brand-primary-subtle text-text-brand">
                    <Icon icon={feature.icon} />
                  </span>
                  <span className="text-body-strong text-text-primary">{tWelcome(`features.${feature.key}`)}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex w-full flex-col gap-24 rounded-xl bg-surface-card p-24 shadow-elev-2 tablet:mx-auto tablet:max-w-[440px] tablet:p-32 laptop:mx-0 laptop:justify-self-end">
            {!configured && (
              <p role="note" className="rounded-lg bg-status-warning-subtle p-16 text-caption text-text-primary">
                {t("auth.notConfigured")}
              </p>
            )}
            {children}
          </div>
        </div>
      </main>
    </ToastProvider>
  );
}
