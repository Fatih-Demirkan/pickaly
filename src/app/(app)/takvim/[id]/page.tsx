import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CalendarScreen } from "@/features/calendar/components/CalendarScreen";
import { ItemDetailDrawer } from "@/features/calendar/components/ItemDetailDrawer";
import { parseCalendarQuery } from "@/features/calendar/routes";
import { calendarRepository } from "@/features/calendar/server";

// Kayıt Detayı — doğrudan adresle açılış. Takvim, kaydın günüyle arkada çizilir. Takvimden açılış: @drawer/(.)[id].
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calendar.detail");
  return { title: t("title") };
}

export default async function CalendarItemPage({ params, searchParams }: PageProps<"/takvim/[id]">) {
  await connection();
  const [{ id }, rawQuery] = await Promise.all([params, searchParams]);
  const item = await calendarRepository.get(decodeURIComponent(id));
  if (!item) notFound();
  const query = parseCalendarQuery(rawQuery);
  const current = { ...query, day: query.day ?? item.date };

  return (
    <>
      <CalendarScreen query={current} />
      <ItemDetailDrawer id={item.id} query={current} />
    </>
  );
}
