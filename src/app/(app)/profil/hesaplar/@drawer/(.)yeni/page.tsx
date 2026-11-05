import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AccountFormDrawer } from "@/features/accounts/components/AccountFormDrawer";

// Listeden açılan Hesap Ekle (intercept). Doğrudan adres: ../../yeni/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts.form");
  return { title: t("newTitle") };
}

export default async function InterceptedNewAccount() {
  await connection();
  return <AccountFormDrawer mode="create" />;
}
