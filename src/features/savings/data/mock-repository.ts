import "server-only";
import { addDays, localDateTimeToIso, toDateKey } from "@/lib/dates";
import { majorToMinor } from "@/lib/money";
import { nthOccurrence } from "@/lib/recurrence";
import type { SavingsAccount, SavingsMovement } from "../domain/types";
import type { SavingsRepository } from "./repository";

// GEÇİCİ YEREL ÖRNEK VERİ DEPOSU — gerçek kullanıcı verisi değildir.
// Veriler sunucu belleğinde tutulur: sunucu yeniden başlayınca örnek verilere döner.
// Hesaplar Pages → Birikimler ve Birikim Hesabı Detayı örneklerinden alınmıştır: "Acil Durum Fonu" (Vadeli, İş Bankası,
// hedef 60.000 ₺, aylık 5.000 ₺ katkı, not), "Ev Peşinatı Birikimi" (Gram Altın, 25 / 100 adet) ve Yeni Birikim formu
// örneği "Araba Yenileme Fonu" (Vadeli Mevduat, 15.000 / 1.250.000 ₺). Tarihler bugüne göre üretilir.
// Açılış bakiyeleri banka hesaplarına dokunmaz (örnek verinin geçmişi); düzenli katkılar Ana Hesap'tan aktarılır.

type Store = { accounts: SavingsAccount[]; movements: SavingsMovement[] };

function buildSeed(): Store {
  const today = toDateKey(new Date());
  // Acil Durum Fonu: 7 ay önce 10.000 ₺ ile açıldı, her ay 5.000 ₺ katkı (bugüne kadar ~45.000 ₺).
  const emergencyOpened = nthOccurrence(today, "monthly", -7);
  const accounts: SavingsAccount[] = [
    {
      id: "sav-emergency",
      name: "Acil Durum Fonu",
      kind: "deposit",
      unit: "TRY",
      institution: "İş Bankası (Vadeli TL)",
      target: majorToMinor(60000),
      openedAt: emergencyOpened,
      note: "En az 6 aylık sabit gideri karşılayana kadar dokunulmayacak acil durum rezervi.",
      contribution: {
        amount: majorToMinor(5000),
        frequency: "monthly",
        startDate: nthOccurrence(emergencyOpened, "monthly", 1),
        time: "09:00",
        reminder: "1d",
        sourceAccountId: "acc-main",
        generatedThrough: null,
      },
      icon: "emergency",
      color: "red",
    },
    {
      id: "sav-home",
      name: "Ev Peşinatı Birikimi",
      kind: "gold",
      unit: "piece",
      institution: "Gram Altın",
      target: BigInt(100 * 100),
      openedAt: addDays(today, -120),
      note: null,
      contribution: null,
      icon: "home",
      color: "green",
    },
    {
      id: "sav-car",
      name: "Araba Yenileme Fonu",
      kind: "deposit",
      unit: "TRY",
      institution: null,
      target: majorToMinor(1250000),
      openedAt: addDays(today, -20),
      note: null,
      contribution: null,
      icon: "savings",
      color: "blue",
    },
  ];
  const opening = (accountId: string, amount: bigint, date: string): SavingsMovement => ({
    id: `mov-${accountId}-open`,
    accountId,
    direction: "in",
    amount,
    transferMinor: null,
    bankAccountId: null,
    occurredAt: localDateTimeToIso(date, "09:00"),
    source: "initial",
  });
  const movements: SavingsMovement[] = [
    opening("sav-emergency", majorToMinor(10000), emergencyOpened),
    opening("sav-home", BigInt(25 * 100), addDays(today, -120)),
    opening("sav-car", majorToMinor(15000), addDays(today, -20)),
  ];
  return { accounts, movements };
}

const store = globalThis as typeof globalThis & { __pickalyMockSavings?: Store };

function data(): Store {
  store.__pickalyMockSavings ??= buildSeed();
  return store.__pickalyMockSavings;
}

export const mockSavingsRepository: SavingsRepository = {
  async listAccounts() {
    return [...data().accounts];
  },
  async getAccount(id) {
    return data().accounts.find((account) => account.id === id) ?? null;
  },
  async createAccount(input) {
    const account: SavingsAccount = { ...input, id: crypto.randomUUID() };
    data().accounts.push(account);
    return account;
  },
  async updateAccount(id, patch) {
    const account = data().accounts.find((item) => item.id === id);
    if (!account) return null;
    Object.assign(account, patch);
    return account;
  },
  async removeAccount(id) {
    const current = data();
    current.accounts = current.accounts.filter((account) => account.id !== id);
  },
  async listMovements(accountId) {
    return data().movements.filter((movement) => !accountId || movement.accountId === accountId);
  },
  async createMovement(input) {
    const movement: SavingsMovement = { ...input, id: crypto.randomUUID() };
    data().movements.push(movement);
    return movement;
  },
};
