"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setFlash } from "@/lib/flash";
import { getAccountMap } from "@/features/accounts/server";
import { isLocale } from "@/i18n/config";
import { localDateTimeToIso, toTimeValue } from "@/lib/dates";
import { parseMoneyInput } from "@/lib/money";
import { nthOccurrence } from "@/lib/recurrence";
import { unitForKind } from "./domain/types";
import { savingsHref } from "./routes";
import {
  movementFormSchema,
  savingsFormSchema,
  type MovementFormErrorKey,
  type MovementFormField,
  type MovementFormState,
  type SavingsFormErrorKey,
  type SavingsFormField,
  type SavingsFormState,
} from "./schemas";
import { getSavingsDetail, savingsRepository } from "./server";

// Birikim hesabı oluşturma, düzenleme, para ekleme / çekme ve kapatma. Şimdilik yerel örnek veri deposuna yazar.
// [Auth aşaması] Her aksiyonda oturum ve sahiplik kontrolü eklenecek (TECH_STACK §6.3).

const ZERO = BigInt(0);

async function amountParser() {
  const locale = await getLocale();
  return (value: string) => parseMoneyInput(value, isLocale(locale) ? locale : "tr");
}

function revalidateSavings() {
  // Birikimler, Ana Sayfa (Birikim Hedefi, Toplam Bakiye) ve hesap bakiyeleri birlikte değişir.
  revalidatePath("/", "layout");
}

async function parseSavingsForm(formData: FormData, mode: "create" | "edit") {
  const field = (name: string) => formData.get(name) ?? "";
  const parsed = savingsFormSchema.safeParse({
    name: field("name"),
    kind: formData.get("kind"),
    unit: formData.get("unit"),
    amount: field("amount"),
    target: field("target"),
    sourceAccountId: field("sourceAccountId"),
    date: field("date"),
    time: field("time"),
    repeat: formData.get("repeat") ?? "false",
    frequency: formData.get("frequency"),
    reminder: formData.get("reminder"),
    note: field("note"),
  });
  const errors: Partial<Record<SavingsFormField, SavingsFormErrorKey>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const name = issue.path[0] as SavingsFormField;
      if (name !== "kind" && name !== "unit" && name !== "repeat") errors[name] ??= issue.message as SavingsFormErrorKey;
    }
    return { ok: false as const, state: { errors, formError: "summary" as const } };
  }

  const data = parsed.data;
  const parse = await amountParser();
  const unit = unitForKind(data.kind, data.unit);
  const amount = data.amount ? parse(data.amount) : ZERO;
  if (amount === null) errors.amount = "amount";
  const target = data.target ? parse(data.target) : null;
  if (data.target && (target === null || target <= ZERO)) errors.target = "target";
  // Düzenli katkı tutarı formdaki tutardır ("Aynı birikim periyodik eklensin", Pages).
  if (data.repeat && (amount === null || amount <= ZERO)) errors.amount = "repeatAmount";
  // Birikim her zaman bir hesaba bağlıdır ("İşlem Yapılan Hesap"); para ekle / çek ve katkılar bu hesaptan yapılır.
  void mode;
  if (!(await getAccountMap()).has(data.sourceAccountId)) errors.sourceAccountId = "account";

  if (Object.keys(errors).length > 0 || amount === null) return { ok: false as const, state: { errors, formError: "summary" as const } };
  return { ok: true as const, data, unit, amount, target };
}

export async function createSavingsAccount(_previous: SavingsFormState, formData: FormData): Promise<SavingsFormState> {
  const result = await parseSavingsForm(formData, "create");
  if (!result.ok) return result.state;
  const { data, unit, amount, target } = result;

  const account = await savingsRepository.createAccount({
    name: data.name,
    kind: data.kind,
    unit,
    accountId: data.sourceAccountId,
    target,
    openedAt: data.date,
    note: data.note || null,
    contribution: data.repeat
      ? {
          amount,
          frequency: data.frequency,
          startDate: nthOccurrence(data.date, data.frequency, 1),
          time: data.time,
          reminder: data.reminder,
          sourceAccountId: data.sourceAccountId,
          generatedThrough: null,
        }
      : null,
    icon: "savings",
    color: "slate",
  });
  if (amount > ZERO) {
    // Başlangıç bakiyesi kaynak hesaptan aktarılır ("Ana hesabınızdan anında aktarılacaktır", Pages).
    // Adet / gram birimli hesapta TL tutarı girilmediği için hesaplara dokunulmaz (BR-SAV-004).
    await savingsRepository.createMovement({
      accountId: account.id,
      direction: "in",
      amount,
      transferMinor: unit === "TRY" ? amount : null,
      bankAccountId: unit === "TRY" ? data.sourceAccountId : null,
      occurredAt: localDateTimeToIso(data.date, data.time),
      source: "initial",
    });
  }
  revalidateSavings();
  await setFlash("savingsCreated");
  redirect("/");
}

export async function updateSavingsAccount(id: string, _previous: SavingsFormState, formData: FormData): Promise<SavingsFormState> {
  const existing = await savingsRepository.getAccount(id);
  if (!existing) return { formError: "notFound" };
  const result = await parseSavingsForm(formData, "edit");
  if (!result.ok) return result.state;
  const { data, amount, target } = result;

  // Tür ve birim düzenlemede değişmez (geçmiş hareketlerin birimi korunur). Tekrar kuralının düzenlenmesi yalnızca
  // gelecekteki katkıları etkiler (BR-REC-004).
  const keepsRule = existing.contribution && existing.contribution.frequency === data.frequency;
  await savingsRepository.updateAccount(id, {
    name: data.name,
    accountId: data.sourceAccountId,
    target,
    note: data.note || null,
    contribution: data.repeat
      ? {
          amount,
          frequency: data.frequency,
          startDate: keepsRule && existing.contribution ? existing.contribution.startDate : nthOccurrence(data.date, data.frequency, 1),
          time: data.time,
          reminder: data.reminder,
          sourceAccountId: data.sourceAccountId,
          generatedThrough: keepsRule && existing.contribution ? existing.contribution.generatedThrough : null,
        }
      : null,
  });
  revalidateSavings();
  await setFlash("savingsUpdated");
  redirect(savingsHref(id));
}

/**
 * Para ekle / Çek (FR-SAV-005/006): birikimin bağlı hesabından birikime veya birikimden o hesaba aktarım
 * (BR-SAV-001/002). Hesap formda sorulmaz (ürün sahibi kararı 2026-11-05). Adet / gram birimde hesaplara dokunulmaz.
 */
export async function moveSavingsAction(id: string, _previous: MovementFormState, formData: FormData): Promise<MovementFormState> {
  const detail = await getSavingsDetail(id);
  if (!detail) return { formError: "notFound" };
  const parsed = movementFormSchema.safeParse({
    direction: formData.get("direction"),
    amount: formData.get("amount") ?? "",
    date: formData.get("date") ?? "",
  });
  const errors: Partial<Record<MovementFormField, MovementFormErrorKey>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const name = issue.path[0] as MovementFormField;
      if (name !== "direction") errors[name] ??= issue.message as MovementFormErrorKey;
    }
    return { errors, formError: "summary" };
  }

  const data = parsed.data;
  const { account } = detail;
  const parse = await amountParser();
  const amount = parse(data.amount);
  if (amount === null || amount <= ZERO) errors.amount = "amount";
  // Çekilecek miktar birikim bakiyesinden büyükse işlem engellenir (PRD §7.3).
  else if (data.direction === "out" && amount > account.balance) errors.amount = "insufficient";
  if (Object.keys(errors).length > 0 || amount === null) return { errors, formError: "summary" };
  // TRY'de aktarılan tutar miktarın kendisidir ve bağlı hesaba yansır; bağlı hesap silinmişse yansımaz.
  const bankAccountId = account.unit === "TRY" && account.accountId && (await getAccountMap()).has(account.accountId) ? account.accountId : null;

  // [Varsayım] Saat istek anıdır (Pages'ta hareketin saati gösterilmiyor).
  await savingsRepository.createMovement({
    accountId: account.id,
    direction: data.direction,
    amount,
    transferMinor: bankAccountId ? amount : null,
    bankAccountId,
    occurredAt: localDateTimeToIso(data.date, toTimeValue(new Date())),
    source: "manual",
  });
  revalidateSavings();
  await setFlash(data.direction === "in" ? "savingsMovedIn" : "savingsMovedOut");
  redirect("/");
}

/**
 * "Birikim hesabını kapat / Sil" → onay (FR-SAV-011, Karar #7). Bakiyesi olan TRY hesabında bakiye seçilen hesaba
 * aktarılır; "aktarmadan kapat" seçilebilir (PRD Q-15). Kayıt kalıcı silinir; daha önceki aktarımların banka
 * bakiyelerine etkisi korunur.
 */
export async function closeSavingsAccountAction(id: string, formData: FormData): Promise<void> {
  const detail = await getSavingsDetail(id);
  if (detail) {
    const target = String(formData.get("targetAccountId") ?? "");
    const { account } = detail;
    if (account.unit === "TRY" && account.balance > ZERO && target && (await getAccountMap()).has(target)) {
      await savingsRepository.createMovement({
        accountId: account.id,
        direction: "out",
        amount: account.balance,
        transferMinor: account.balance,
        bankAccountId: target,
        occurredAt: new Date().toISOString(),
        source: "closing",
      });
    }
    await savingsRepository.removeAccount(id);
  }
  revalidateSavings();
  if (detail) await setFlash("savingsClosed");
  redirect("/birikimler");
}
