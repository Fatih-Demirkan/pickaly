import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { TransactionsOverview } from "@/features/transactions/components/TransactionsOverview";
import { parseListQuery } from "@/features/transactions/routes";
import { toMonthKey } from "@/lib/dates";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.transactions");
  return { title: t("title") };
}

export default async function TransactionsPage({ searchParams }: PageProps<"/islemler">) {
  // Tarihler ve örnek veri istek anındaki zamana göre hesaplanır: sayfa istek anında render edilir (cacheComponents).
  await connection();
  const query = parseListQuery(await searchParams);
  return <TransactionsOverview query={{ ...query, month: query.month ?? toMonthKey(new Date()) }} />;
}
