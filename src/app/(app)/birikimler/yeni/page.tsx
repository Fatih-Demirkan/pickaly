import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { SavingsFormDrawer } from "@/features/savings/components/SavingsFormDrawer";
import { SavingsOverview } from "@/features/savings/components/SavingsOverview";

// Yeni Birikim Hesabı — doğrudan adresle açılış; arkada Birikimler listesi çizilir. Listeden açılış: @drawer/(.)yeni.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("savings.form");
  return { title: t("newTitle") };
}

export default async function NewSavingsPage() {
  await connection();
  return (
    <>
      <SavingsOverview />
      <SavingsFormDrawer mode="create" />
    </>
  );
}
