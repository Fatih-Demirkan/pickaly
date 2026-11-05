import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AccountManagement } from "@/features/accounts/components/AccountManagement";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts");
  return { title: t("title") };
}

export default async function AccountsPage() {
  await connection(); // Bakiyeler istek anına göre hesaplanır (cacheComponents).
  return <AccountManagement />;
}
