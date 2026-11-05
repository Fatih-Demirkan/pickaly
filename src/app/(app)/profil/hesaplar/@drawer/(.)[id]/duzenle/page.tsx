import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AccountFormDrawer } from "@/features/accounts/components/AccountFormDrawer";

// Listeden açılan Hesabı Düzenle (intercept). Doğrudan adres: ../../../[id]/duzenle/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts.form");
  return { title: t("editTitle") };
}

export default async function InterceptedEditAccount({ params }: PageProps<"/profil/hesaplar/[id]/duzenle">) {
  await connection();
  const { id } = await params;
  return <AccountFormDrawer mode="edit" id={decodeURIComponent(id)} />;
}
