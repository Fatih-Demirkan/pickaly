import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { listCategories } from "@/features/categories/server";
import { isLocale } from "@/i18n/config";
import type { DateKey } from "@/lib/dates";
import { formatMoneyInput } from "@/lib/money";
import type { CalendarItemKind } from "../domain/types";
import { calendarHref, itemHref } from "../routes";
import { calendarRepository } from "../server";
import { ItemForm, type ItemFormValues } from "./ItemForm";
import { newItemFormValues } from "./itemFormDefaults";

// Görev Ekle / Düzenle sunumu (RESPONSIVE §3.2.5, §8.2.1): mobil tam sayfa · tablet+ sağ drawer 560 px.
// Header "Yeni Görev" + "× İptal" (Yeni İşlem ile aynı).

type ItemFormDrawerProps = { mode: "create"; kind?: CalendarItemKind; date?: DateKey } | { mode: "edit"; id: string };

export async function ItemFormDrawer(props: ItemFormDrawerProps) {
  const [t, rawLocale, categories] = await Promise.all([getTranslations("calendar.form"), getLocale(), listCategories("calendar")]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";

  let initialValues: ItemFormValues;
  let cancelHref: string;
  if (props.mode === "edit") {
    const item = await calendarRepository.get(props.id);
    if (!item) notFound();
    cancelHref = itemHref(item.id, { day: item.date });
    initialValues = {
      // Görev / Randevu ayrımı kaldırıldı (ürün sahibi kararı 2026-11-05): kaydedilince Görev olur.
      kind: "task",
      title: item.title,
      description: item.description ?? "",
      priority: item.priority,
      categoryId: item.categoryId ?? "",
      date: item.date,
      allDay: item.time === null,
      time: item.time ?? "09:00",
      duration: item.durationMinutes ? String(item.durationMinutes) : "",
      reminder: item.reminder,
      // Tek konum alanı: eski kayıtlarda ayrı tutulan ad ve adres birleştirilir; kaydedilince tek alanda saklanır.
      locationName: [item.locationName, item.locationAddress].filter(Boolean).join(", "),
      locationAddress: "",
      multi: item.subtasks.length > 0,
      subtasks: item.subtasks,
      note: item.note ?? "",
      plannedExpense: item.plannedExpenseMinor !== null ? formatMoneyInput(item.plannedExpenseMinor, locale) : "",
    };
  } else {
    initialValues = newItemFormValues({ date: props.date });
    cancelHref = calendarHref({ day: initialValues.date as DateKey });
  }

  // Arşivli kategoriler yeni seçimde çıkmaz; düzenlenen kaydın mevcut kategorisi korunur (BR-CAT-002).
  const selectable = categories.filter((category) => !category.archived || category.id === initialValues.categoryId);
  const title = props.mode === "create" ? t("newTitle") : t("editTitle");
  const titleId = "calendar-form-title";

  return (
    <Drawer closeHref={cancelHref} closeLabel={t("cancel")} labelledBy={titleId} size="form">
      <FocusHeader
        title={title}
        titleId={titleId}
        trailing={
          <Link
            href={cancelHref}
            scroll={false}
            className="touch-target -me-8 inline-flex h-40 items-center gap-4 rounded-full px-8 text-body-strong text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary"
          >
            <Icon icon="close" size="sm" />
            {t("cancel")}
          </Link>
        }
      />
      <DrawerBody>
        <ItemForm
          mode={props.mode}
          itemId={props.mode === "edit" ? props.id : undefined}
          initialValues={initialValues}
          categories={selectable}
          cancelHref={cancelHref}
        />
      </DrawerBody>
    </Drawer>
  );
}
