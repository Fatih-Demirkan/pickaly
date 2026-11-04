import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ItemFormDrawer } from "@/features/calendar/components/ItemFormDrawer";

// Kayıt Detayı'ndan açılan Düzenle (intercept). Doğrudan adres: ../../../[id]/duzenle/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calendar.form");
  return { title: t("editTitle") };
}

export default async function InterceptedEditCalendarItem({ params }: PageProps<"/takvim/[id]/duzenle">) {
  await connection(); // Tarihler istek anına göre hesaplanır (cacheComponents).
  const { id } = await params;
  return <ItemFormDrawer mode="edit" id={decodeURIComponent(id)} />;
}
