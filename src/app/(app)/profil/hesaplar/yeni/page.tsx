import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AccountFormDrawer } from "@/features/accounts/components/AccountFormDrawer";
import { AccountManagement } from "@/features/accounts/components/AccountManagement";

// Hesap Ekle — doğrudan adresle açılış; arkada Hesaplarım çizilir. Listeden açılış: @drawer/(.)yeni.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts.form");
  return { title: t("newTitle") };
}

export default async function NewAccountPage() {
  await connection();
  return (
    <>
      <AccountManagement />
      <AccountFormDrawer mode="create" />
    </>
  );
}
