import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { TransferFormDrawer } from "@/features/accounts/components/TransferFormDrawer";

// Listeden açılan Para Aktar (intercept). Doğrudan adres: ../../aktarim/page.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts.transfer");
  return { title: t("title") };
}

export default async function InterceptedTransfer() {
  await connection();
  return <TransferFormDrawer />;
}
