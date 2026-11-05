// Hesap modeli (TECH_STACK §5.2 accounts, PRD DM-003). Bakiye saklanmaz; açılış bakiyesi + gerçekleşmiş işlemler +
// hesaplar arası aktarımlar + birikim aktarımlarından hesaplanır (PRD BR-MON-002).
// Hesap yönetimi (ürün sahibi isteği 2026-11-05): ad + açılış bakiyesi + isteğe bağlı açıklama; düzenleme, arşivleme,
// silme ve hesaplar arası para aktarımı.

export type Account = {
  id: string;
  name: string;
  /** İsteğe bağlı açıklama: ödeme yöntemi ve kart son haneleri (ör. "Banka Kartı (••4821)"). */
  detail: string | null;
  openingBalanceMinor: bigint;
  /** Kayıtta otomatik oluşan "Ana Hesap" (FR-AUTH-005). Silinemez ve arşivlenemez. */
  isDefault: boolean;
  /** Arşivlenmiş hesap seçicilerde görünmez; geçmiş kayıtlar ve bakiye korunur. */
  archived: boolean;
};

/** Hesaplar arası para aktarımı. Gelir / gider sayılmaz; yalnızca iki hesabın bakiyesini değiştirir. */
export type AccountTransfer = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amountMinor: bigint;
  occurredAt: string;
  note: string | null;
};

export const ACCOUNT_NAME_MAX_LENGTH = 60;
export const ACCOUNT_DETAIL_MAX_LENGTH = 60;
export const TRANSFER_NOTE_MAX_LENGTH = 200;

/** Aktarımların bir hesabın bakiyesine net etkisi. */
export function transferEffect(accountId: string, transfers: readonly AccountTransfer[]): bigint {
  return transfers.reduce((total, transfer) => {
    if (transfer.toAccountId === accountId) return total + transfer.amountMinor;
    if (transfer.fromAccountId === accountId) return total - transfer.amountMinor;
    return total;
  }, BigInt(0));
}
