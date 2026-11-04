import { redirect } from "next/navigation";
import { connection } from "next/server";
import { reportHref } from "@/features/reports/routes";
import { toMonthKey } from "@/lib/dates";

// /raporlar → içinde bulunulan ayın Aylık Finans Raporu (Ana Sayfa ve Birikimler "Aylık Rapor" bağlantısı).
export default async function ReportsIndexPage() {
  await connection(); // Ay istek anına göre belirlenir (cacheComponents).
  redirect(reportHref(toMonthKey(new Date())));
}
