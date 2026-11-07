import "server-only";
import { cache } from "react";
import { localDateTimeToIso, toDateKey, toMonthKey, type DateKey } from "@/lib/dates";
import { isSupabaseConfigured } from "@/lib/env";
import { occurrencesBetween } from "@/lib/recurrence";
import { DuplicateRecordError } from "@/lib/supabase/data";
import type { SavingsRepository } from "./data/repository";
import { mockSavingsRepository } from "./data/mock-repository";
import { supabaseSavingsRepository } from "./data/supabase-repository";
import { progressPercent, signedMovement, type SavingsAccount, type SavingsAccountView, type SavingsMovement } from "./domain/types";

// Birikim verisine sunucu tarafı erişim ve kuralları (PRD §7, BR-SAV). Supabase geldiğinde yalnızca burası değişir.
// [Supabase aşaması] Düzenli katkı üretimi zamanlanmış işe, aktarımlar transactions.type = transfer kaydına taşınır
// (TECH_STACK §5.2); imzalar korunur.

export const savingsRepository: SavingsRepository = isSupabaseConfigured() ? supabaseSavingsRepository : mockSavingsRepository;

/** Tarihi gelen Düzenli Katkı'ları kaynak hesaptan aktarım olarak oluşturur (FR-SAV-007, BR-SAV-001). */
async function generateContributions(now: Date) {
  const today = toDateKey(now);
  for (const account of await savingsRepository.listAccounts()) {
    const rule = account.contribution;
    if (!rule) continue;
    let through = rule.generatedThrough;
    for (const date of occurrencesBetween(rule.startDate, rule.frequency, rule.generatedThrough, today)) {
      const occurredAt = localDateTimeToIso(date, rule.time);
      if (new Date(occurredAt) > now) break;
      try {
        await savingsRepository.createMovement({
          accountId: account.id,
          direction: "in",
          amount: rule.amount,
          transferMinor: account.unit === "TRY" ? rule.amount : null,
          bankAccountId: account.unit === "TRY" ? rule.sourceAccountId : null,
          occurredAt,
          source: "recurring",
        });
      } catch (error) {
        // Eşzamanlı bir istek aynı dönemi oluşturdu.
        if (!(error instanceof DuplicateRecordError)) throw error;
      }
      through = date;
    }
    if (through !== rule.generatedThrough) await savingsRepository.updateAccount(account.id, { contribution: { ...rule, generatedThrough: through } });
  }
}

// İstek başına tek üretim; kullanıcılar birbirinin üretimini beklemez.
const ensureGenerated = cache(() => generateContributions(new Date()));

function toView(account: SavingsAccount, movements: readonly SavingsMovement[]): SavingsAccountView {
  const own = movements.filter((movement) => movement.accountId === account.id).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  return { ...account, balance: own.reduce((total, movement) => total + signedMovement(movement), BigInt(0)), lastMovement: own[0] ?? null };
}

export async function listSavingsAccounts(): Promise<SavingsAccountView[]> {
  await ensureGenerated();
  const [accounts, movements] = await Promise.all([savingsRepository.listAccounts(), savingsRepository.listMovements()]);
  return accounts.map((account) => toView(account, movements));
}

/** Tüm birikim hareketleri (tarihi gelen düzenli katkılar üretilmiş olarak). */
export async function listSavingsMovements(): Promise<SavingsMovement[]> {
  await ensureGenerated();
  return savingsRepository.listMovements();
}

export type SavingsDetail ={ account: SavingsAccountView; movements: SavingsMovement[] };

export async function getSavingsDetail(id: string): Promise<SavingsDetail | null> {
  await ensureGenerated();
  const [account, movements] = await Promise.all([savingsRepository.getAccount(id), savingsRepository.listMovements(id)]);
  if (!account) return null;
  return { account: toView(account, movements), movements: [...movements].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)) };
}

export type SavingsSummary = {
  /** Toplam Birikim Varlığı: yalnızca TRY birimli hesaplar (BR-SAV-004). */
  totalMinor: bigint;
  /** Bu ay TRY birimli hesaplara eklenen net tutar ve önceki toplama göre artış yüzdesi (FR-SAV-003). */
  monthAddedMinor: bigint;
  monthPercent: number | null;
};

export function summarizeSavings(accounts: readonly SavingsAccountView[], movements: readonly SavingsMovement[], month: string): SavingsSummary {
  const tryIds = new Set(accounts.filter((account) => account.unit === "TRY").map((account) => account.id));
  const totalMinor = accounts.filter((account) => tryIds.has(account.id)).reduce((sum, account) => sum + account.balance, BigInt(0));
  const monthAddedMinor = movements
    .filter((movement) => movement.accountId !== null && tryIds.has(movement.accountId) && movement.source !== "closing" && toMonthKey(new Date(movement.occurredAt)) === month)
    .reduce((sum, movement) => sum + signedMovement(movement), BigInt(0));
  const before = totalMinor - monthAddedMinor;
  // [Varsayım] Artış yüzdesi ay başındaki toplama göre (Pages: "+8.500,00 ₺ bu ay eklendi (%6,7 artış)").
  const monthPercent = before > BigInt(0) ? Number((monthAddedMinor * BigInt(1000)) / before) / 10 : null;
  return { totalMinor, monthAddedMinor, monthPercent };
}

export async function getSavingsOverview(today: DateKey) {
  const accounts = await listSavingsAccounts();
  const movements = await savingsRepository.listMovements();
  return { accounts, summary: summarizeSavings(accounts, movements, today.slice(0, 7)) };
}

/**
 * Banka hesabı kimliği → birikim aktarımlarının net etkisi (kuruş). Birikime ekleme hesabı azaltır, çekme artırır
 * (BR-SAV-001/002, BR-SAV-003). Hesap bakiyeleri bu etkiyle hesaplanır.
 */
export async function getSavingsTransfersByAccount(asOf?: Date): Promise<Map<string, bigint>> {
  await ensureGenerated();
  const result = new Map<string, bigint>();
  for (const movement of await savingsRepository.listMovements()) {
    if (!movement.bankAccountId || movement.transferMinor === null) continue;
    // asOf verilirse yalnızca o güne kadar (yerel gün, dahil) gerçekleşmiş hareketler (BR-BAL-002).
    if (asOf && toDateKey(new Date(movement.occurredAt)) > toDateKey(asOf)) continue;
    const delta = movement.direction === "in" ? -movement.transferMinor : movement.transferMinor;
    result.set(movement.bankAccountId, (result.get(movement.bankAccountId) ?? BigInt(0)) + delta);
  }
  return result;
}

/**
 * Ana Sayfa "Birikim Hedefi": tamamlanmaya en yakın aktif hedef (PRD FR-DSH-009, Q-2).
 * [Eksik] Birikim Detayı'ndaki "Ana Sayfa'da göster" seçimi tasarlanmadı.
 */
export async function getFeaturedGoal(): Promise<SavingsAccountView | null> {
  const accounts = await listSavingsAccounts();
  const candidates = accounts.filter((account) => {
    const percent = progressPercent(account);
    return percent !== null && percent < 100;
  });
  return candidates.sort((a, b) => (progressPercent(b) ?? 0) - (progressPercent(a) ?? 0))[0] ?? null;
}
