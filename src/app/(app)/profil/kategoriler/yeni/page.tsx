import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CategoryFormDrawer } from "@/features/categories/components/CategoryFormDrawer";
import { CategoryManagement } from "@/features/categories/components/CategoryManagement";
import { parseCategoryTypeParam, tabOfType } from "@/features/categories/routes";

// Yeni Kategori — doğrudan adresle açılış; arkada Kategori Yönetimi çizilir. Listeden açılış: @drawer/(.)yeni.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories.form");
  return { title: t("newTitle") };
}

export default async function NewCategoryPage({ searchParams }: PageProps<"/profil/kategoriler/yeni">) {
  await connection(); // Kullanım sayıları istek anına göre hesaplanır (cacheComponents).
  const type = parseCategoryTypeParam((await searchParams).tur);
  return (
    <>
      <CategoryManagement tab={tabOfType(type)} />
      <CategoryFormDrawer mode="create" type={type} />
    </>
  );
}
