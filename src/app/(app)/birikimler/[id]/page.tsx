import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { SavingsDetail } from "@/features/savings/components/SavingsDetail";
import { savingsRepository } from "@/features/savings/server";

// Birikim Hesabı Detayı — tam sayfa (RESPONSIVE §3.4.3).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("savings.detail");
  return { title: t("title") };
}

export default async function SavingsDetailPage({ params }: PageProps<"/birikimler/[id]">) {
  await connection();
  const { id } = await params;
  const account = await savingsRepository.getAccount(decodeURIComponent(id));
  if (!account) notFound();
  return <SavingsDetail id={account.id} />;
}
