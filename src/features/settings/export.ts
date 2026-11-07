import "server-only";
import { listAccounts, listTransfers } from "@/features/accounts/server";
import { calendarRepository } from "@/features/calendar/server";
import { listCategories } from "@/features/categories/server";
import { listRecurringPayments } from "@/features/payments/server";
import { listSavingsAccounts, listSavingsMovements } from "@/features/savings/server";
import { recurringRuleRepository, transactionRepository } from "@/features/transactions/server";
import type { Locale } from "@/i18n/config";
import { toDateKey, toTimeValue } from "@/lib/dates";
import { formatMoneyInput } from "@/lib/money";

// Verileri Yedekle & Dışa Aktar (PRD FR-SET-010, TECH_STACK §4.7 / D-17):
//   JSON → tam yedek · CSV → işlemler; Excel ile açılır (UTF-8 BOM, ";" ayraç, Türkçe Excel uyumu). XLSX V1.1.
// Tutarlar JSON'da kuruş cinsinden metin (bigint), CSV'de kullanıcının dilindeki ondalık biçimle yazılır.
// [Auth aşaması] Üretim kullanıcının kendi oturumuyla (RLS'li) çalışır; şimdilik yerel örnek veri.

const ALL_DATES = { from: "0000-01-01", to: "9999-12-31" };

export async function buildJsonExport(): Promise<string> {
  const [transactions, recurringRules, recurringPayments, categories, accounts, accountTransfers, savingsAccounts, savingsMovements, calendarItems] = await Promise.all([
    transactionRepository.listAll(),
    recurringRuleRepository.listActive(),
    listRecurringPayments(),
    listCategories(),
    listAccounts({ includeArchived: true }),
    listTransfers(),
    listSavingsAccounts(),
    listSavingsMovements(),
    calendarRepository.listBetween(ALL_DATES.from, ALL_DATES.to),
  ]);
  const backup = {
    app: "Pickaly",
    version: 1,
    exportedAt: new Date().toISOString(),
    currency: "TRY",
    amountUnit: "minor",
    data: { accounts, accountTransfers, categories, transactions, recurringRules, recurringPayments, savingsAccounts, savingsMovements, calendarItems },
  };
  return JSON.stringify(backup, (_key, value) => (typeof value === "bigint" ? value.toString() : value), 2);
}

export type CsvHeaders = { date: string; time: string; type: string; title: string; amount: string; category: string; account: string; note: string };

function csvField(value: string): string {
  return /[;"\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export async function buildTransactionsCsv(locale: Locale, headers: CsvHeaders, typeLabels: { income: string; expense: string }): Promise<string> {
  // Arşivlenmiş hesaplar da dahil: geçmiş işlemlerin hesap adı CSV'de boş kalmasın.
  const [transactions, categories, accounts] = await Promise.all([transactionRepository.listAll(), listCategories(), listAccounts({ includeArchived: true })]);
  const categoryName = new Map(categories.map((category) => [category.id, category.name]));
  const accountName = new Map(accounts.map((account) => [account.id, account.name]));
  const rows = [...transactions]
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    .map((transaction) => {
      const at = new Date(transaction.occurredAt);
      const amount = formatMoneyInput(transaction.amountMinor, locale);
      return [
        toDateKey(at),
        toTimeValue(at),
        typeLabels[transaction.type],
        transaction.title,
        transaction.type === "expense" ? `-${amount}` : amount,
        categoryName.get(transaction.categoryId) ?? "",
        accountName.get(transaction.accountId) ?? "",
        transaction.note ?? "",
      ];
    });
  const header = [headers.date, headers.time, headers.type, headers.title, headers.amount, headers.category, headers.account, headers.note];
  // BOM: Excel'in dosyayı UTF-8 olarak açması için.
  return `﻿${[header, ...rows].map((row) => row.map(csvField).join(";")).join("\r\n")}\r\n`;
}
