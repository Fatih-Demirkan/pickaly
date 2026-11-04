import { redirect } from "next/navigation";
import { editCategoryHref } from "@/features/categories/routes";

// Kategori detay ekranı yok (Pages): /profil/kategoriler/[id] düzenlemeye yönlenir. Segmentin bir sayfası olması,
// listeden açılan @drawer/(.)[id]/duzenle intercept'inin soft navigasyonda çözülmesi için de gerekir.
export default async function CategoryPage({ params }: PageProps<"/profil/kategoriler/[id]">) {
  const { id } = await params;
  redirect(editCategoryHref(decodeURIComponent(id)));
}
