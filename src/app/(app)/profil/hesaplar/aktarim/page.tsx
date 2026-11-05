import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AccountManagement } from "@/features/accounts/components/AccountManagement";
import { TransferFormDrawer } from "@/features/accounts/components/TransferFormDrawer";

// Para Aktar — doğrudan adresle açılış; arkada Hesaplarım çizilir. Listeden açılış: @drawer/(.)aktarim.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts.transfer");
  return { title: t("title") };
}

export default async function TransferPage() {
  await connection();
  return (
    <>
      <AccountManagement />
      <TransferFormDrawer />
    </>
  );
}
