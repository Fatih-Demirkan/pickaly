import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { CategoryFormDrawer } from "@/features/categories/components/CategoryFormDrawer";
import { CategoryManagement } from "@/features/categories/components/CategoryManagement";
import { tabOfType } from "@/features/categories/routes";
import { getCategory } from "@/features/categories/server";

// Kategoriyi Düzenle — doğrudan adresle açılış; arkada Kategori Yönetimi çizilir. Listeden açılış: @drawer/(.)[id]/duzenle.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories.form");
  return { title: t("editTitle") };
}

export default async function EditCategoryPage({ params }: PageProps<"/profil/kategoriler/[id]/duzenle">) {
  await connection(); // Kullanım sayıları istek anına göre hesaplanır (cacheComponents).
  const { id } = await params;
  const category = await getCategory(decodeURIComponent(id));
  if (!category) notFound();
  return (
    <>
      <CategoryManagement tab={tabOfType(category.type)} />
      <CategoryFormDrawer mode="edit" id={category.id} />
    </>
  );
}
