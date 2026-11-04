import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ItemFormDrawer } from "@/features/calendar/components/ItemFormDrawer";
import { parseKindParam } from "@/features/calendar/routes";
import { isDateKey } from "@/lib/dates";

// Takvimden açılan Görev Ekle (intercept). Doğrudan adres ve diğer ekranlardan açılış: ../../yeni/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calendar.form");
  return { title: t("newTitle") };
}

export default async function InterceptedNewCalendarItem({ searchParams }: PageProps<"/takvim/yeni">) {
  await connection(); // Tarihler istek anına göre hesaplanır (cacheComponents).
  const { tur, tarih } = await searchParams;
  return <ItemFormDrawer mode="create" kind={parseKindParam(tur)} date={isDateKey(tarih) ? tarih : undefined} />;
}
