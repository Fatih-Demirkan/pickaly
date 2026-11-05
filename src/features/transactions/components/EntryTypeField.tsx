"use client";

import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { NewEntryType } from "../routes";

// Yeni İşlem sheet'inin tür seçimi (ürün sahibi kararı 2026-11-05): Ana Sayfa Hızlı Aksiyonlar ile aynı seçenekler,
// aynı sıra ve aynı adlar: Gelir · Gider · Ödeme (= Abonelik) · Görev. Görev, Görev Ekle formunu gösterir.
// Segmented control: DESIGN_SYSTEM_PICKALY §5.5. Etiket Yeni İşlem formundaki "İşlem Türü *" ile aynı.

const ORDER: readonly NewEntryType[] = ["income", "expense", "subscription", "task"];
const LABEL_KEY = { income: "income", expense: "expense", task: "task", subscription: "payment" } as const;

export function EntryTypeField({ value, onChange }: { value: NewEntryType; onChange: (value: NewEntryType) => void }) {
  const t = useTranslations("transactions.form");
  const tQuick = useTranslations("dashboard.quick");

  return (
    <div className="flex flex-col gap-8">
      <p id="entry-type-label" className="text-body-strong text-text-primary">
        {t("type")}
        <span aria-hidden className="text-text-danger">
          {" "}*
        </span>
        <span className="sr-only"> ({t("required")})</span>
      </p>
      <SegmentedControl
        label={t("type")}
        fullWidth
        value={value}
        onChange={onChange}
        options={ORDER.map((type) => ({ value: type, label: tQuick(LABEL_KEY[type]) }))}
      />
    </div>
  );
}
