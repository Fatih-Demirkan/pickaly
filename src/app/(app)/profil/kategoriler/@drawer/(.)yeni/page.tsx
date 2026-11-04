import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CategoryFormDrawer } from "@/features/categories/components/CategoryFormDrawer";
import { parseCategoryTypeParam } from "@/features/categories/routes";

// Listeden açılan Yeni Kategori (intercept). Doğrudan adres: ../../yeni/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories.form");
  return { title: t("newTitle") };
}

export default async function InterceptedNewCategory({ searchParams }: PageProps<"/profil/kategoriler/yeni">) {
  await connection(); // Kategori verisi istek anında okunur (cacheComponents).
  return <CategoryFormDrawer mode="create" type={parseCategoryTypeParam((await searchParams).tur)} />;
}
