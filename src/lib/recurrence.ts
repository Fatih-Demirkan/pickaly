import { addDays, type DateKey } from "./dates";

// Tekrar kuralları (PRD BR-REC-001…004, Q-12). Saf takvim hesabı: React, Next veya veri katmanı import etmez.
// Gelir/gider "Tekrar Eden İşlem", Abonelik (tekrarlayan ödeme) ve ileride tekrarlayan görevler aynı kuralı kullanır.

/** Tekrar sıklığı (PRD Q-12). */
export const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export function isFrequency(value: unknown): value is Frequency {
  return typeof value === "string" && (FREQUENCIES as readonly string[]).includes(value);
}

/**
 * Hatırlatma Bildirimi seçenekleri.
 * [Varsayım] Pages'ta görünen tek değer "1 saat önce"; Ödeme Detayı'nda "Vadeden 2 gün & 1 gün önce" örneği var.
 * Seçenek listesi tanımlı değil (RESPONSIVE §4.5.1 #5); kayıt başına tek hatırlatma tutulur.
 */
export const REMINDER_OFFSETS = ["none", "1h", "1d", "2d", "1w"] as const;
export type ReminderOffset = (typeof REMINDER_OFFSETS)[number];
export const DEFAULT_REMINDER: ReminderOffset = "1h";

export function isReminderOffset(value: unknown): value is ReminderOffset {
  return typeof value === "string" && (REMINDER_OFFSETS as readonly string[]).includes(value);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/** Başlangıçtan itibaren n. örneğin tarihi (n = 0 başlangıçtır). */
export function nthOccurrence(start: DateKey, frequency: Frequency, n: number): DateKey {
  if (frequency === "daily") return addDays(start, n);
  if (frequency === "weekly") return addDays(start, n * 7);
  const [year = 0, month = 1, day = 1] = start.split("-").map(Number);
  const months = frequency === "monthly" ? n : n * 12;
  const targetYear = year + Math.floor((month - 1 + months) / 12);
  const targetMonth = (((month - 1 + months) % 12) + 12) % 12;
  // Ayın 29–31'i seçildiyse o gün olmayan aylarda ayın son günü kullanılır (BR-REC-002); sonraki aylar
  // yine başlangıç gününe döner (31 Ocak → 28 Şubat → 31 Mart).
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth));
  return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
}

/** `after` (hariç) ile `until` (dahil) arasındaki örnek tarihleri; `after` null ise başlangıç da dahildir. */
export function occurrencesBetween(start: DateKey, frequency: Frequency, after: DateKey | null, until: DateKey): DateKey[] {
  const dates: DateKey[] = [];
  for (let n = 0; ; n += 1) {
    const date = nthOccurrence(start, frequency, n);
    if (date > until) break;
    if (after === null || date > after) dates.push(date);
  }
  return dates;
}

/**
 * Türkçe bulunma eki: "22'sinde", "1'inde", "3'ünde", "6'sında", "10'unda".
 * Ek, sayının okunuşundaki son sözcüğe göre seçilir (son hane, sıfırsa onlar basamağı).
 */
export function turkishLocativeSuffix(value: number): string {
  const ones: Record<number, string> = { 1: "inde", 2: "sinde", 3: "ünde", 4: "ünde", 5: "inde", 6: "sında", 7: "sinde", 8: "inde", 9: "unda" };
  const tens: Record<number, string> = { 1: "unda", 2: "sinde", 3: "unda" };
  const last = value % 10;
  return last === 0 ? (tens[Math.floor(value / 10)] ?? "inde") : (ones[last] ?? "inde");
}
