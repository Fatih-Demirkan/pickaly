import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CategoryManagement } from "@/features/categories/components/CategoryManagement";
import { parseTabParam } from "@/features/categories/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories");
  return { title: t("title") };
}

export default async function CategoriesPage({ searchParams }: PageProps<"/profil/kategoriler">) {
  await connection(); // Kullanım sayıları istek anına göre hesaplanır (cacheComponents).
  const { sekme } = await searchParams;
  return <CategoryManagement tab={parseTabParam(sekme)} />;
}
