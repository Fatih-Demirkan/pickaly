import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ItemDetailDrawer } from "@/features/calendar/components/ItemDetailDrawer";
import { parseCalendarQuery } from "@/features/calendar/routes";

// Takvimden açılan Kayıt Detayı (intercept). Doğrudan adres: ../../[id]/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calendar.detail");
  return { title: t("title") };
}

export default async function InterceptedCalendarItem({ params, searchParams }: PageProps<"/takvim/[id]">) {
  await connection(); // Tarihler istek anına göre hesaplanır (cacheComponents).
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <ItemDetailDrawer id={decodeURIComponent(id)} query={parseCalendarQuery(query)} />;
}
