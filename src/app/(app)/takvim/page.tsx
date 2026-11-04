import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CalendarScreen } from "@/features/calendar/components/CalendarScreen";
import { parseCalendarQuery } from "@/features/calendar/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.calendar");
  return { title: t("title") };
}

// Takvim: ?gorunum=aylik|haftalik&gun=YYYY-MM-DD. Bugün ve örnek veri istek anına göre hesaplanır (cacheComponents).
export default async function CalendarPage({ searchParams }: PageProps<"/takvim">) {
  await connection();
  return <CalendarScreen query={parseCalendarQuery(await searchParams)} />;
}
