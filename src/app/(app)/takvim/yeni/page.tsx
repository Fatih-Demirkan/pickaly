import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CalendarScreen } from "@/features/calendar/components/CalendarScreen";
import { ItemFormDrawer } from "@/features/calendar/components/ItemFormDrawer";
import { parseKindParam } from "@/features/calendar/routes";
import { isDateKey } from "@/lib/dates";

// Görev Ekle — doğrudan adresle ve diğer ekranlardan (Ana Sayfa Hızlı Aksiyonlar "Görev") açılış.
//   ?tur=gorev|randevu  ?tarih=YYYY-MM-DD. Takvimden açılış: @drawer/(.)yeni.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calendar.form");
  return { title: t("newTitle") };
}

export default async function NewCalendarItemPage({ searchParams }: PageProps<"/takvim/yeni">) {
  await connection();
  const { tur, tarih } = await searchParams;
  const date = isDateKey(tarih) ? tarih : undefined;

  return (
    <>
      <CalendarScreen query={{ day: date }} />
      <ItemFormDrawer mode="create" kind={parseKindParam(tur)} date={date} />
    </>
  );
}
