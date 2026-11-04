"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@/components/ui/Toast";
import { setLocale } from "@/i18n/actions";
import { isLocale, locales, type Locale } from "@/i18n/config";
import type { WeekStart } from "@/lib/dates";
import { setWeekStartAction } from "../actions";
import { WEEK_STARTS } from "../domain/types";
import { SettingsPickerRow } from "./SettingsPickerRow";

// Profil ve Ayarlar → değer seçimli satırlar: Uygulama Dili (FR-SET-003), Haftanın İlk Günü (FR-SET-005),
// Verileri Yedekle & Dışa Aktar (FR-SET-010: JSON tam yedek / CSV işlemler, TECH_STACK §4.7).
// [Varsayım] Dışa aktarma biçimi satırdan açılan seçiciyle seçilir; seçim ekranı tasarlanmadı.

export function LanguageRow() {
  const t = useTranslations("settings");
  const tLocale = useTranslations("locale");
  const rawLocale = useLocale();
  const current: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <SettingsPickerRow
      icon="language"
      title={t("language.title")}
      hint={t("language.hint")}
      valueLabel={tLocale(current)}
      pickerTitle={t("language.title")}
      options={locales.map((locale) => ({ value: locale, label: tLocale(locale) }))}
      value={current}
      pending={pending}
      onSelect={(next) => {
        if (next === current) return;
        startTransition(async () => {
          await setLocale(next);
          document.documentElement.lang = next;
          router.refresh();
        });
      }}
    />
  );
}

export function WeekStartRow({ weekStart }: { weekStart: WeekStart }) {
  const t = useTranslations("settings");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const label = (value: WeekStart) => t(`weekStart.day${value}`);

  return (
    <SettingsPickerRow
      icon="weekStart"
      title={t("weekStart.title")}
      hint={t("weekStart.hint")}
      valueLabel={label(weekStart)}
      pickerTitle={t("weekStart.title")}
      options={WEEK_STARTS.map((value) => ({ value: String(value) as `${WeekStart}`, label: label(value) }))}
      value={String(weekStart) as `${WeekStart}`}
      pending={pending}
      onSelect={(next) => {
        const value = Number(next) as WeekStart;
        if (value === weekStart) return;
        startTransition(async () => {
          const result = await setWeekStartAction(value);
          if (!result.ok) toast({ message: t("failed"), tone: "error" });
          router.refresh();
        });
      }}
    />
  );
}

export function ExportRow() {
  const t = useTranslations("settings.export");

  return (
    <SettingsPickerRow<"json" | "csv" | "">
      icon="download"
      title={t("title")}
      hint={t("hint")}
      pickerTitle={t("choose")}
      options={[
        { value: "json", label: t("json"), description: t("jsonHint") },
        { value: "csv", label: t("csvOption"), description: t("csvHint") },
      ]}
      value=""
      onSelect={(format) => {
        if (!format) return;
        // Route Handler dosyayı "attachment" olarak döner; sayfa değişmez.
        const link = document.createElement("a");
        link.href = `/profil/disa-aktar?bicim=${format}`;
        link.click();
      }}
    />
  );
}
