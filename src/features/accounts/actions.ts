"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAccountBalances, transactionRepository } from "@/features/transactions/server";
import { intlLocale, isLocale } from "@/i18n/config";
import { localDateTimeToIso } from "@/lib/dates";
import { setFlash } from "@/lib/flash";
import { parseMoneyInput } from "@/lib/money";
import { ACCOUNTS_PATH } from "./routes";
import {
  accountFormSchema,
  transferFormSchema,
  type AccountFormErrorKey,
  type AccountFormField,
  type AccountFormState,
  type TransferFormErrorKey,
  type TransferFormField,
  type TransferFormState,
} from "./schemas";
import { createAccount, createTransfer, deleteAccount, getAccount, isAccountInUse, listAccounts, setAccountArchived, updateAccount } from "./server";

// Hesap ekleme, düzenleme, arşivleme / silme ve hesaplar arası para aktarımı (ürün sahibi isteği 2026-11-05).
// Kayıttan sonra Hesaplarım ekranına dönülür ve toast gösterilir (flash).

const ZERO = BigInt(0);

function revalidateAccounts() {
  // Hesap adları ve bakiyeleri formlarda, listelerde, Ana Sayfa'da ve raporlarda görünür.
  revalidatePath("/", "layout");
}

async function currentLocale() {
  const locale = await getLocale();
  return isLocale(locale) ? locale : "tr";
}

export async function saveAccount(id: string | null, _previous: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const existing = id ? await getAccount(id) : null;
  if (id && !existing) return { formError: "notFound" };
  const parsed = accountFormSchema.safeParse({
    name: formData.get("name") ?? "",
    detail: formData.get("detail") ?? "",
    balance: formData.get("balance") ?? "",
  });
  const errors: Partial<Record<AccountFormField, AccountFormErrorKey>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors[issue.path[0] as AccountFormField] ??= issue.message as AccountFormErrorKey;
    return { errors, formError: "summary" };
  }
  const data = parsed.data;
  const locale = await currentLocale();
  // Güncel bakiye: boş veya 0 olabilir; başta "-" varsa eksi bakiye.
  const raw = data.balance.replace(/[\s₺]/g, "");
  const negative = raw.startsWith("-");
  const digits = negative ? raw.slice(1) : raw;
  const magnitude = digits === "" || /^0+([.,]0+)?$/.test(digits) ? ZERO : parseMoneyInput(digits, locale);
  if (magnitude === null) errors.balance = "balance";
  const desired = magnitude === null ? null : negative ? -magnitude : magnitude;
  // Ad, aktif hesaplar arasında benzersiz (büyük / küçük harf duyarsız).
  const tag = intlLocale[locale];
  const duplicate = (await listAccounts()).some((account) => account.id !== id && account.name.toLocaleLowerCase(tag) === data.name.toLocaleLowerCase(tag));
  if (duplicate) errors.name = "duplicate";
  if (Object.keys(errors).length > 0 || desired === null) return { errors, formError: "summary" };

  // Kullanıcı hesabın şu anki bakiyesini girer. Kayıtlı hareketlerin (gelir / gider, aktarımlar, birikim) etkisi
  // korunur; fark açılış bakiyesine yazılır. Böylece raporlar ve geçmiş kayıtlar değişmez.
  let opening = desired;
  if (existing) {
    const current = (await getAccountBalances()).get(existing.id) ?? existing.openingBalanceMinor;
    opening = desired - (current - existing.openingBalanceMinor);
  }

  const input = { name: data.name, detail: data.detail || null, openingBalanceMinor: opening };
  if (id) {
    if (!(await updateAccount(id, input))) return { formError: "notFound" };
  } else {
    await createAccount(input);
  }
  revalidateAccounts();
  await setFlash(id ? "accountUpdated" : "accountCreated");
  redirect(ACCOUNTS_PATH);
}

/**
 * "Hesabı sil" → onay. Varsayılan hesap ("Ana Hesap") silinmez. Kaydı olan hesap silinmez, arşivlenir (listelerde gizlenir,
 * geçmiş kayıtlar ve bakiye korunur); kaydı olmayan hesap kalıcı silinir.
 */
export async function removeAccountAction(id: string): Promise<void> {
  const account = await getAccount(id);
  if (account && !account.isDefault) {
    const transactions = await transactionRepository.listAll();
    if (await isAccountInUse(id, new Set(transactions.map((transaction) => transaction.accountId)))) {
      await setAccountArchived(id, true);
      await setFlash("accountArchived");
    } else {
      await deleteAccount(id);
      await setFlash("accountDeleted");
    }
  }
  revalidateAccounts();
  redirect(ACCOUNTS_PATH);
}

/** Arşivlenmiş hesabı geri alır. */
export async function restoreAccountAction(id: string): Promise<void> {
  await setAccountArchived(id, false);
  revalidateAccounts();
}

/** Hesaplar arası para aktarımı: gelir / gider sayılmaz; kaynak hesap azalır, hedef hesap artar. */
export async function createTransferAction(_previous: TransferFormState, formData: FormData): Promise<TransferFormState> {
  const parsed = transferFormSchema.safeParse({
    fromAccountId: formData.get("fromAccountId") ?? "",
    toAccountId: formData.get("toAccountId") ?? "",
    amount: formData.get("amount") ?? "",
    date: formData.get("date") ?? "",
    time: formData.get("time") ?? "",
    note: formData.get("note") ?? "",
  });
  const errors: Partial<Record<TransferFormField, TransferFormErrorKey>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors[issue.path[0] as TransferFormField] ??= issue.message as TransferFormErrorKey;
    return { errors, formError: "summary" };
  }
  const data = parsed.data;
  const active = new Set((await listAccounts()).map((account) => account.id));
  if (!active.has(data.fromAccountId)) errors.fromAccountId = "account";
  if (!active.has(data.toAccountId)) errors.toAccountId = "account";
  else if (data.fromAccountId === data.toAccountId) errors.toAccountId = "sameAccount";
  const amount = parseMoneyInput(data.amount, await currentLocale());
  if (amount === null) errors.amount = "amount";
  if (Object.keys(errors).length > 0 || amount === null) return { errors, formError: "summary" };

  await createTransfer({
    fromAccountId: data.fromAccountId,
    toAccountId: data.toAccountId,
    amountMinor: amount,
    occurredAt: localDateTimeToIso(data.date, data.time),
    note: data.note || null,
  });
  revalidateAccounts();
  await setFlash("transferCreated");
  redirect(ACCOUNTS_PATH);
}
