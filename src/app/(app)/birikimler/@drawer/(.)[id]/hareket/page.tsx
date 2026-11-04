import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { MovementFormDrawer } from "@/features/savings/components/MovementFormDrawer";
import { parseDirectionParam } from "@/features/savings/routes";

// Detaydan açılan Para ekle / Çek (intercept). Doğrudan adres: ../../../[id]/hareket/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("savings.move");
  return { title: t("title") };
}

export default async function InterceptedSavingsMovement({ params, searchParams }: PageProps<"/birikimler/[id]/hareket">) {
  await connection(); // Tarihler istek anına göre hesaplanır (cacheComponents).
  const [{ id }, { yon }] = await Promise.all([params, searchParams]);
  return <MovementFormDrawer id={decodeURIComponent(id)} direction={parseDirectionParam(yon)} />;
}
