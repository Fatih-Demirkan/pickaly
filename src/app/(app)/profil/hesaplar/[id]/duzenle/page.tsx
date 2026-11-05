import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AccountFormDrawer } from "@/features/accounts/components/AccountFormDrawer";
import { AccountManagement } from "@/features/accounts/components/AccountManagement";

// Hesabı Düzenle — doğrudan adresle açılış; arkada Hesaplarım çizilir. Listeden açılış: @drawer/(.)[id]/duzenle.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts.form");
  return { title: t("editTitle") };
}

export default async function EditAccountPage({ params }: PageProps<"/profil/hesaplar/[id]/duzenle">) {
  await connection();
  const { id } = await params;
  return (
    <>
      <AccountManagement />
      <AccountFormDrawer mode="edit" id={decodeURIComponent(id)} />
    </>
  );
}
