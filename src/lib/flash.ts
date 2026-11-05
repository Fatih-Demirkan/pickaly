import "server-only";
import { cookies } from "next/headers";

// Yönlendirme sonrası tek seferlik bildirim ("flash"). Sunucu aksiyonu kaydı yaptıktan sonra redirect() ile başka
// sayfaya gittiği için toast istemcide doğrudan gösterilemez: aksiyon kısa ömürlü bir çerez bırakır, istemcideki
// FlashToast (src/components/ui/FlashToast.tsx) çerezi okuyup çeviriyle toast gösterir ve çerezi siler.
// Çerez yalnızca bir çeviri anahtarı taşır (kişisel veri yok); httpOnly değildir çünkü istemci okur.

export const FLASH_COOKIE = "pk_flash";

export const FLASH_KEYS = [
  "transactionCreated",
  "subscriptionCreated",
  "transactionUpdated",
  "transactionDeleted",
  "itemCreated",
  "itemUpdated",
  "itemDeleted",
  "savingsCreated",
  "savingsUpdated",
  "savingsMovedIn",
  "savingsMovedOut",
  "savingsClosed",
  "accountCreated",
  "accountUpdated",
  "accountArchived",
  "accountDeleted",
  "transferCreated",
] as const;

export type FlashKey = (typeof FLASH_KEYS)[number];

export async function setFlash(key: FlashKey) {
  (await cookies()).set(FLASH_COOKIE, key, { path: "/", maxAge: 60, sameSite: "lax", httpOnly: false });
}
