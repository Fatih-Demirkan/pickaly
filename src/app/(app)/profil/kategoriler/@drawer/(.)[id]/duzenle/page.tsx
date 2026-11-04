import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CategoryFormDrawer } from "@/features/categories/components/CategoryFormDrawer";

// Listeden açılan Kategoriyi Düzenle (intercept). Doğrudan adres: ../../../[id]/duzenle/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories.form");
  return { title: t("editTitle") };
}

export default async function InterceptedEditCategory({ params }: PageProps<"/profil/kategoriler/[id]/duzenle">) {
  await connection(); // Kategori verisi istek anında okunur (cacheComponents).
  const { id } = await params;
  return <CategoryFormDrawer mode="edit" id={decodeURIComponent(id)} />;
}
