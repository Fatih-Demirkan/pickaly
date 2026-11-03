"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";
import { Icon } from "./Icon";

/**
 * Dil seçici – örnek kullanım. Görsel kalıp Pages'taki Segmented Control'den alınmıştır
 * (DESIGN §8.8): kap surface-muted + çerçeve + radius-md + 4 px iç boşluk, seçili öğe surface-card + shadow-sm.
 * İleride Profil → Uygulama Dili seçicisine (PRD FR-SET-003) bağlanacak.
 */
export function LanguageSwitcher() {
  const t = useTranslations("locale");
  const current = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === current) return;
    startTransition(async () => {
      await setLocale(next);
      document.documentElement.lang = next;
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-8">
      <span className="flex items-center gap-4 text-label-sm text-text-secondary">
        <Icon icon="language" size="sm" />
        {t("label")}
      </span>
      <div
        role="group"
        aria-label={t("label")}
        aria-busy={isPending}
        className="inline-flex gap-4 rounded-md border border-border-default bg-surface-muted p-4"
      >
        {locales.map((locale) => {
          const selected = locale === current;
          return (
            <button
              key={locale}
              type="button"
              lang={locale}
              aria-pressed={selected}
              disabled={isPending}
              onClick={() => change(locale)}
              className={[
                "min-h-32 rounded-sm px-12 text-button transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                "disabled:cursor-not-allowed",
                selected ? "bg-surface-card text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {t(locale)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
