import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { SavingsDetail } from "@/features/savings/components/SavingsDetail";
import { SavingsFormDrawer } from "@/features/savings/components/SavingsFormDrawer";
import { savingsRepository } from "@/features/savings/server";

// Hesabı Düzenle — doğrudan adresle açılış; arkada detay çizilir. Detaydan açılış: @drawer/(.)[id]/duzenle.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("savings.form");
  return { title: t("editTitle") };
}

export default async function EditSavingsPage({ params }: PageProps<"/birikimler/[id]/duzenle">) {
  await connection();
  const { id } = await params;
  const account = await savingsRepository.getAccount(decodeURIComponent(id));
  if (!account) notFound();
  return (
    <>
      <SavingsDetail id={account.id} />
      <SavingsFormDrawer mode="edit" id={account.id} />
    </>
  );
}
