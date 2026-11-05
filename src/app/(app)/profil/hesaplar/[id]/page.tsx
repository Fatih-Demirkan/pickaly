import { redirect } from "next/navigation";
import { editAccountHref } from "@/features/accounts/routes";

// Hesap detay ekranı yok: /profil/hesaplar/[id] adresi düzenlemeye yönlenir.
export default async function AccountPage({ params }: PageProps<"/profil/hesaplar/[id]">) {
  const { id } = await params;
  redirect(editAccountHref(decodeURIComponent(id)));
}
