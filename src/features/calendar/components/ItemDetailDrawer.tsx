import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { Drawer } from "@/components/ui/Drawer";
import { getCategoryMap } from "@/features/categories/server";
import { isLocale } from "@/i18n/config";
import { calendarHref, type CalendarQuery } from "../routes";
import { calendarRepository } from "../server";
import { ItemDetail } from "./ItemDetail";

// Kayıt Detayı sunumu (RESPONSIVE §3.2.4): mobil tam sayfa · tablet ve üstü sağ drawer 480 px; alt aksiyonlar
// drawer footer'ında. Kapatınca gelinen görünüm ve güne dönülür.

export async function ItemDetailDrawer({ id, query }: { id: string; query: CalendarQuery }) {
  const item = await calendarRepository.get(id);
  if (!item) notFound();

  const [t, rawLocale, categories] = await Promise.all([getTranslations("calendar.detail"), getLocale(), getCategoryMap()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const closeHref = calendarHref({ view: query.view, day: query.day ?? item.date });
  const titleId = `calendar-item-${item.id}`;

  return (
    <Drawer closeHref={closeHref} closeLabel={t("close")} labelledBy={titleId} size="detail">
      <FocusHeader title={t("title")} titleId={titleId} back={{ href: closeHref, label: t("back") }} />
      <DrawerBody>
        <ItemDetail
          item={item}
          category={item.categoryId ? categories.get(item.categoryId) : undefined}
          locale={locale}
          editHref={`/takvim/${encodeURIComponent(item.id)}/duzenle`}
        />
      </DrawerBody>
    </Drawer>
  );
}
