// Hesap modeli (TECH_STACK §5.2 accounts, PRD DM-003). Bakiye saklanmaz; açılış bakiyesi + gerçekleşmiş
// işlemlerden hesaplanır (PRD BR-MON-002).

export type Account = {
  id: string;
  name: string;
  /** İkincil satır: ödeme yöntemi ve kart son haneleri (Pages: "Banka Kartı (••4821)"). */
  detail: string | null;
  openingBalanceMinor: bigint;
};
