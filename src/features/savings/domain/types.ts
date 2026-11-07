import type { DateKey } from "@/lib/dates";
import type { Frequency, ReminderOffset } from "@/lib/recurrence";

// Birikim hesabı (PRD §7, DM-008; TECH_STACK §5.2 savings). Pages'ta birikim "birikim hesabı" olarak modellenmiş:
// kendi bakiyesi, türü, bağlı olduğu hesap ve hedefi vardır. Bir hesap = bir hedef [PRD Öneri].
// Bakiye saklanmaz; hareketlerden hesaplanır. Para ekleme/çekme bir aktarımdır (BR-SAV-001/002): gelir/gider sayılmaz.

/** Pages → Yeni Birikim Hesabı "Hesap Türü". */
export type SavingsKind = "gold" | "deposit" | "fund" | "currency" | "cash";
export const SAVINGS_KINDS: readonly SavingsKind[] = ["gold", "deposit", "fund", "currency", "cash"];

/**
 * Birim (PRD §7.2, D-6): TRY veya adet / gram. Adet/gram birimli hesaplarda TL karşılığı gösterilmez ve
 * Toplam Birikim Varlığı'na katılmaz (BR-SAV-004).
 * [Varsayım] Yalnızca Altın / Kıymetli türü adet veya gram olabilir; Döviz Sepeti TL karşılığıyla tutulur.
 */
export type SavingsUnit = "TRY" | "piece" | "gram";

/** Düzenli Katkı (PRD FR-SAV-007): Yeni Birikim formundaki "Tekrar Eden İşlem". */
export type SavingsContribution = {
  /** Birim cinsinden, yüzde birlik (TRY'de kuruş). */
  amount: bigint;
  frequency: Frequency;
  /** İlk katkı günü (hesap açılışından sonraki ilk dönem). */
  startDate: DateKey;
  time: string;
  reminder: ReminderOffset;
  sourceAccountId: string;
  /** Bu güne kadarki katkılar üretildi. */
  generatedThrough: DateKey | null;
};

export type SavingsAccount = {
  id: string;
  name: string;
  kind: SavingsKind;
  unit: SavingsUnit;
  /**
   * Bağlı hesap (ürün sahibi kararı 2026-11-05; "Saklama Kurumu" metninin yerine). Başlangıç bakiyesi, para ekle / çek
   * ve düzenli katkı bu hesaptan yapılır. null = eski kayıt, hesaplara yansımaz.
   */
  accountId: string | null;
  /** Birim cinsinden hedef, yüzde birlik; null = hedefsiz birikim, ilerleme gösterilmez (PRD §7.2). */
  target: bigint | null;
  openedAt: DateKey;
  note: string | null;
  contribution: SavingsContribution | null;
  /** [Varsayım] Pages'taki kart ikonları (octagon-alert, birdhouse) hesaba özgü; yeni hesapta türün varsayılanı. */
  icon: SavingsIconName;
  color: "red" | "green" | "blue" | "orange" | "slate";
};

export type SavingsIconName = "emergency" | "home" | "savings";

export type SavingsMovementSource = "initial" | "manual" | "recurring" | "closing";

/** Geçmiş Hareketler satırı (PRD FR-SAV-008). */
export type SavingsMovement = {
  id: string;
  /**
   * Birikim hesabı. null: hesap kapatılıp silindi; banka hesabına yansımış hareket, banka bakiyesi bozulmasın diye
   * kayıtta kalır (migration 20261107180000).
   */
  accountId: string | null;
  direction: "in" | "out";
  /** Birim cinsinden miktar, yüzde birlik. */
  amount: bigint;
  /** Banka hesabına yansıyan TL tutarı (kuruş); null = hesaplara dokunulmaz (BR-SAV-004, açılış bakiyesi). */
  transferMinor: bigint | null;
  /** Kaynak (ekleme) veya hedef (çekme) banka hesabı. */
  bankAccountId: string | null;
  occurredAt: string;
  source: SavingsMovementSource;
};

/** Hesap + hareketlerden hesaplanan değerler. */
export type SavingsAccountView = SavingsAccount & {
  balance: bigint;
  lastMovement: SavingsMovement | null;
};

/** Tamamlanma yüzdesi. %100'ü geçebilir; çubuk %100'de durur (BR-SAV-005). */
export function progressPercent(account: Pick<SavingsAccountView, "target" | "balance">): number | null {
  if (account.target === null || account.target <= BigInt(0)) return null;
  return Number((account.balance * BigInt(100)) / account.target);
}

export function unitForKind(kind: SavingsKind, preferred?: SavingsUnit): SavingsUnit {
  if (kind !== "gold") return "TRY";
  return preferred === "gram" ? "gram" : "piece";
}

export function signedMovement(movement: Pick<SavingsMovement, "direction" | "amount">): bigint {
  return movement.direction === "in" ? movement.amount : -movement.amount;
}
