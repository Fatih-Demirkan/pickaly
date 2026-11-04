import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { SavingsOverview } from "@/features/savings/components/SavingsOverview";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.savings");
  return { title: t("title") };
}

// Birikimler. Bakiyeler ve "bu ay eklendi" istek anına göre hesaplanır (cacheComponents).
export default async function SavingsPage() {
  await connection();
  return <SavingsOverview />;
}
