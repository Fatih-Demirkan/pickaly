import "server-only";
import { listSavingsMovements } from "@/features/savings/server";
import { transactionRepository } from "@/features/transactions/server";
import type { MonthKey } from "@/lib/dates";
import { buildMonthlyReport, type MonthlyReport } from "./domain/report";

// Rapor verisine sunucu tarafı erişim (TECH_STACK §5.5). Supabase geldiğinde monthly_report(month) RPC'si çağrılır.

export async function getMonthlyReport(month: MonthKey): Promise<MonthlyReport> {
  const [transactions, movements] = await Promise.all([transactionRepository.listByMonth(month), listSavingsMovements()]);
  return buildMonthlyReport(month, transactions, movements);
}
