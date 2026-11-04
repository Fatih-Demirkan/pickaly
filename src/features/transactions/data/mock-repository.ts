import "server-only";
// [Geçici istisna] Örnek veride ödenmiş abonelik vadelerinin işlemleri payments örnek verisinden gelir;
// iki modülün örnek verisi tutarlı kalsın diye iç dosya import edilir. Supabase geldiğinde kaldırılır.
import { buildPaymentSeed } from "@/features/payments/data/seed";
import { isDemoDataEnabled } from "@/lib/env";
import { localDateTimeToIso, toDateKey, toMonthKey, type MonthKey } from "@/lib/dates";
import { majorToMinor } from "@/lib/money";
import type { RecurringRule, Transaction, TransactionInput, TransactionType } from "../domain/types";
import type { RecurringRuleRepository, TransactionRepository } from "./repository";

// GEÇİCİ YEREL ÖRNEK VERİ DEPOSU — gerçek kullanıcı verisi değildir.
// Veriler sunucu belleğinde tutulur: sunucu yeniden başlayınca örnek verilere döner.
// Başlık, tutar, saat ve notlar Pages → İşlemler ve İşlem Detayı örneklerinden alınmıştır;
// tarihler ekranın boş görünmemesi için bugüne göre üretilir.
// Örnek içerik yalnızca PICKALY_DEMO_DATA=true iken yüklenir; varsayılan olarak depo boş başlar (lib/env.ts).

type Seed = [daysAgo: number, time: string, type: TransactionType, title: string, amount: number, categoryId: string, accountId: string, extra?: Partial<Transaction>];

const seeds: Seed[] = [
  [0, "15:42", "expense", "Market Alışverişi", 1280, "cat-market", "acc-main"],
  [0, "11:15", "income", "Freelance Tasarım Ödemesi", 8500, "cat-freelance", "acc-main"],
  [0, "08:30", "expense", "Akaryakıt", 650, "cat-transport", "acc-card"],
  [2, "15:42", "expense", "Haftalık Süpermarket Alışverişi", 1280, "cat-market", "acc-main", {
    note: "Organik reyon, zeytinyağı ve temel haftalık sebze meyve alımı.",
    merchantName: "Macrocenter",
    merchantLocation: "Kanyon AVM - Levent",
  }],
  [2, "11:15", "income", "Freelance UI/UX Tasarım Projesi", 8500, "cat-freelance", "acc-main", { note: "Proje teslimatı sonrası onaylanan 2. faz ödemesi" }],
  [4, "15:42", "expense", "Elektrik Faturası", 1280, "cat-bills", "acc-main"],
  [6, "09:00", "income", "Maaş", 33500, "cat-salary", "acc-main"],
  [9, "19:20", "expense", "Akşam Yemeği", 920, "cat-food", "acc-card"],
  [12, "10:05", "expense", "İnternet Faturası", 450, "cat-bills", "acc-main"],
  [18, "16:30", "income", "Kira Geliri", 12000, "cat-rent", "acc-main"],
  [21, "13:10", "expense", "Doğum Günü Hediyesi", 1500, "cat-gift-out", "acc-card"],
  [27, "08:45", "expense", "Akaryakıt", 1100, "cat-transport", "acc-card"],
  [33, "09:00", "income", "Maaş", 33500, "cat-salary", "acc-main"],
  [35, "18:00", "expense", "Market Alışverişi", 2140, "cat-market", "acc-main"],
];

function daysAgoKey(days: number): string {
  return toDateKey(new Date(Date.now() - days * 86_400_000));
}

function buildSeed(): Transaction[] {
  // Ödenmiş örnek abonelik vadelerinin gider işlemleri (Ödeme Detayı → Geçmiş Ödemeler).
  const paymentTransactions = buildPaymentSeed(toDateKey(new Date())).transactions;
  const manual = seeds.map(([daysAgo, time, type, title, amount, categoryId, accountId, extra], index) => ({
    id: `txn-${String(902481 + index)}`,
    type,
    title,
    amountMinor: majorToMinor(amount),
    categoryId,
    accountId,
    occurredAt: localDateTimeToIso(daysAgoKey(daysAgo), time),
    note: null,
    merchantName: null,
    merchantLocation: null,
    source: "manual" as const,
    recurringRuleId: null,
    paymentId: null,
    ...extra,
  }));
  return [...manual, ...paymentTransactions];
}

// Geliştirme sunucusunda modül yeniden yüklense de veriler korunsun diye globalThis'te tutulur.
const store = globalThis as typeof globalThis & { __pickalyMockTransactions?: Transaction[]; __pickalyMockRecurringRules?: RecurringRule[] };

function rows(): Transaction[] {
  store.__pickalyMockTransactions ??= isDemoDataEnabled() ? buildSeed() : [];
  return store.__pickalyMockTransactions;
}

export const mockTransactionRepository: TransactionRepository = {
  async listByMonth(month: MonthKey) {
    return rows().filter((transaction) => toMonthKey(new Date(transaction.occurredAt)) === month);
  },
  async listAll() {
    return [...rows()];
  },
  async get(id) {
    return rows().find((transaction) => transaction.id === id) ?? null;
  },
  async create(input: TransactionInput, origin) {
    const transaction: Transaction = {
      ...input,
      id: crypto.randomUUID(),
      merchantName: null,
      merchantLocation: null,
      source: origin?.source ?? "manual",
      recurringRuleId: origin?.recurringRuleId ?? null,
      paymentId: origin?.paymentId ?? null,
    };
    rows().push(transaction);
    return transaction;
  },
  async update(id, input) {
    const list = rows();
    const index = list.findIndex((transaction) => transaction.id === id);
    const current = list[index];
    if (!current) return null;
    const updated: Transaction = { ...current, ...input };
    list[index] = updated;
    return updated;
  },
  async remove(id) {
    const list = rows();
    const index = list.findIndex((transaction) => transaction.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    return true;
  },
};

// Tekrar Eden İşlem kuralları. Örnek veride kural yoktur; formdan oluşturulanlar burada tutulur.
function rules(): RecurringRule[] {
  store.__pickalyMockRecurringRules ??= [];
  return store.__pickalyMockRecurringRules;
}

export const mockRecurringRuleRepository: RecurringRuleRepository = {
  async listActive() {
    return rules().filter((rule) => rule.active);
  },
  async get(id) {
    return rules().find((rule) => rule.id === id) ?? null;
  },
  async create(rule) {
    const created: RecurringRule = { ...rule, id: crypto.randomUUID() };
    rules().push(created);
    return created;
  },
  async markGenerated(id, through) {
    const rule = rules().find((item) => item.id === id);
    if (rule) rule.generatedThrough = through;
  },
};
