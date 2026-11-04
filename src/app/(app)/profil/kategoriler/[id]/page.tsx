import { redirect } from "next/navigation";
import { editCategoryHref } from "@/features/categories/routes";

// Kategori detay ekranı yok (Pages): /profil/kategoriler/[id] adresi düzenlemeye yönlenir.
export default async function CategoryPage({ params }: PageProps<"/profil/kategoriler/[id]">) {
  const { id } = await params;
  redirect(editCategoryHref(decodeURIComponent(id)));
}
