import { getLocale, getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { buildJsonExport, buildTransactionsCsv } from "@/features/settings/export";
import { isLocale } from "@/i18n/config";
import { toDateKey } from "@/lib/dates";

// GET /profil/disa-aktar?bicim=json|csv — Verileri Yedekle & Dışa Aktar (TECH_STACK §4.7: Route Handler).
export async function GET(request: Request) {
  await connection();
  const format = new URL(request.url).searchParams.get("bicim");
  if (format !== "json" && format !== "csv") return new Response("Unsupported format", { status: 400 });

  const stamp = toDateKey(new Date());
  if (format === "json") {
    return new Response(await buildJsonExport(), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="pickaly-yedek-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const [rawLocale, t] = await Promise.all([getLocale(), getTranslations("settings.export.csv")]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const csv = await buildTransactionsCsv(
    locale,
    { date: t("date"), time: t("time"), type: t("type"), title: t("title"), amount: t("amount"), category: t("category"), account: t("account"), note: t("note") },
    { income: t("income"), expense: t("expense") },
  );
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pickaly-islemler-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
