import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MovementFormDrawer } from "@/features/savings/components/MovementFormDrawer";
import { SavingsDetail } from "@/features/savings/components/SavingsDetail";
import { parseDirectionParam } from "@/features/savings/routes";
import { savingsRepository } from "@/features/savings/server";

// Para ekle / Çek — doğrudan adresle açılış (?yon=ekle|cek); arkada detay çizilir. Detaydan açılış: @drawer/(.)[id]/hareket.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("savings.move");
  return { title: t("title") };
}

export default async function SavingsMovementPage({ params, searchParams }: PageProps<"/birikimler/[id]/hareket">) {
  await connection();
  const [{ id }, { yon }] = await Promise.all([params, searchParams]);
  const account = await savingsRepository.getAccount(decodeURIComponent(id));
  if (!account) notFound();
  return (
    <>
      <SavingsDetail id={account.id} />
      <MovementFormDrawer id={account.id} direction={parseDirectionParam(yon)} />
    </>
  );
}
