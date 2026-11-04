import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CalendarScreen } from "@/features/calendar/components/CalendarScreen";
import { ItemFormDrawer } from "@/features/calendar/components/ItemFormDrawer";
import { calendarRepository } from "@/features/calendar/server";

// Kaydı Düzenle — doğrudan adresle açılış. Takvimden açılış: @drawer/(.)[id]/duzenle.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calendar.form");
  return { title: t("editTitle") };
}

export default async function EditCalendarItemPage({ params }: PageProps<"/takvim/[id]/duzenle">) {
  await connection();
  const { id } = await params;
  const item = await calendarRepository.get(decodeURIComponent(id));
  if (!item) notFound();

  return (
    <>
      <CalendarScreen query={{ day: item.date }} />
      <ItemFormDrawer mode="edit" id={item.id} />
    </>
  );
}
