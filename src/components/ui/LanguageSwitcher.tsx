"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";
import { Icon } from "./Icon";
import { SegmentedControl } from "./SegmentedControl";

/**
 * Dil seçici. İleride Profil → Uygulama Dili seçicisine (PRD FR-SET-003) bağlanacak.
 */
export function LanguageSwitcher() {
  const t = useTranslations("locale");
  const current = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function change(next: Locale) {
    startTransition(async () => {
      await setLocale(next);
      document.documentElement.lang = next;
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-8">
      <span className="flex items-center gap-4 text-label-sm text-text-secondary">
        <Icon icon="language" size="sm" />
        {t("label")}
      </span>
      <SegmentedControl
        label={t("label")}
        value={current}
        onChange={change}
        disabled={isPending}
        options={locales.map((locale) => ({ value: locale, label: t(locale), lang: locale }))}
      />
    </div>
  );
}
