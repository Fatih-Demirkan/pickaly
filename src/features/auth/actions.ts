"use server";

import type { AuthError } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AUTH_CALLBACK_PATH, RESET_PATH, safeNextPath, SIGN_IN_PATH, verifyHref } from "./routes";
import {
  newPasswordSchema,
  resetRequestSchema,
  signInSchema,
  signUpSchema,
  verifySchema,
  type AuthErrorKey,
  type AuthField,
  type AuthFormError,
  type AuthFormState,
} from "./schemas";

// Oturum aksiyonları (PRD FR-AUTH-001…006, D-1): e-posta + şifre, 6 haneli e-posta kodu, "Şifremi unuttum".
// Supabase Auth kendi kullanıcı tablosunu kullanır; bu aksiyonlar için migration gerekmez. Ad, kullanıcı metadata'sında
// (full_name) tutulur. [Supabase aşaması] Profil tablosu ve kayıt sonrası "Ana Hesap" + varsayılan kategoriler (FR-AUTH-005)
// ilk migration ile eklenecek.

function fieldErrors(error: ZodError): Partial<Record<AuthField, AuthErrorKey>> {
  const errors: Partial<Record<AuthField, AuthErrorKey>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as AuthField;
    errors[field] ??= issue.message as AuthErrorKey;
  }
  return errors;
}

/** Supabase hata kodu → arayüz mesajı. Hesabın var olup olmadığını ele veren ayrımlar yapılmaz. */
function formErrorOf(error: AuthError): AuthFormError {
  switch (error.code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    case "otp_expired":
    case "otp_disabled":
      return "codeInvalid";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "rateLimited";
    case "weak_password":
      return "weakPassword";
    case "same_password":
      return "samePassword";
    default:
      return "unknown";
  }
}

async function origin() {
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3000";
  const protocol = list.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

function notConfigured(): AuthFormState {
  return { formError: "notConfigured" };
}

export async function signInAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return notConfigured();
  const parsed = signInSchema.safeParse({ email: formData.get("email") ?? "", password: formData.get("password") ?? "" });
  const values = { email: String(formData.get("email") ?? "") };
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  const next = safeNextPath(formData.get("next"));
  if (error) {
    if (error.code === "email_not_confirmed") {
      // Doğrulanmamış hesap: yeni kod gönderilip doğrulama ekranına geçilir (FR-AUTH-002).
      await supabase.auth.resend({ type: "signup", email: parsed.data.email, options: { emailRedirectTo: `${await origin()}${AUTH_CALLBACK_PATH}` } });
      redirect(verifyHref(parsed.data.email, next));
    }
    return { formError: formErrorOf(error), values };
  }
  redirect(next);
}

export async function signUpAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return notConfigured();
  const raw = {
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    terms: formData.get("terms") ?? "",
  };
  const values = { email: String(raw.email), name: String(raw.name) };
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    // [Eksik] Kullanım koşulları / gizlilik metinleri hukuki onay bekliyor (LB-01); onay tarihi metadata'da tutulur.
    options: { data: { full_name: parsed.data.name, terms_accepted_at: new Date().toISOString() }, emailRedirectTo: `${await origin()}${AUTH_CALLBACK_PATH}` },
  });
  if (error) return { formError: formErrorOf(error), values };
  // Supabase'de "Confirm email" kapalıysa kayıt oturumu hemen açar: doğrulama ekranı atlanır.
  // [Ertelendi] Staging'de e-posta onayı geçici olarak kapalı (ürün sahibi kararı, 2026-11-04); SMTP ve yeni oturum
  // tasarımıyla birlikte yeniden açılacak. Açıldığında akış kendiliğinden doğrulama ekranına döner.
  if (data.session) redirect("/");
  redirect(verifyHref(parsed.data.email));
}

export async function verifySignUpAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return notConfigured();
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = verifySchema.safeParse({ email: formData.get("email") ?? "", code: formData.get("code") ?? "" });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ email: parsed.data.email, token: parsed.data.code, type: "email" });
  if (error) return { formError: error.code === "otp_expired" || error.status === 403 ? "codeInvalid" : formErrorOf(error), values };
  redirect(safeNextPath(formData.get("next")));
}

export async function resendSignUpCodeAction(email: string): Promise<{ ok: boolean; error?: AuthFormError }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "notConfigured" };
  const parsed = resetRequestSchema.safeParse({ email });
  if (!parsed.success) return { ok: false, error: "unknown" };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({ type: "signup", email: parsed.data.email, options: { emailRedirectTo: `${await origin()}${AUTH_CALLBACK_PATH}` } });
  return error ? { ok: false, error: formErrorOf(error) } : { ok: true };
}

/** Şifremi unuttum 1. adım: kod e-postayla gönderilir. Hesap yoksa da aynı yanıt verilir (hesap varlığı ele verilmez). */
export async function requestResetAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return notConfigured();
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") ?? "" });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await origin()}${AUTH_CALLBACK_PATH}?sonra=${encodeURIComponent(`${RESET_PATH}?adim=yeni`)}`,
  });
  if (error && formErrorOf(error) === "rateLimited") return { formError: "rateLimited", values };
  redirect(`${RESET_PATH}?adim=kod&e=${encodeURIComponent(parsed.data.email)}`);
}

/** Şifremi unuttum 2. adım: kod doğrulanınca kurtarma oturumu açılır. */
export async function verifyResetAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return notConfigured();
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = verifySchema.safeParse({ email: formData.get("email") ?? "", code: formData.get("code") ?? "" });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ email: parsed.data.email, token: parsed.data.code, type: "recovery" });
  if (error) return { formError: "codeInvalid", values };
  redirect(`${RESET_PATH}?adim=yeni`);
}

export async function resendResetCodeAction(email: string): Promise<{ ok: boolean; error?: AuthFormError }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "notConfigured" };
  const parsed = resetRequestSchema.safeParse({ email });
  if (!parsed.success) return { ok: false, error: "unknown" };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await origin()}${AUTH_CALLBACK_PATH}?sonra=${encodeURIComponent(`${RESET_PATH}?adim=yeni`)}`,
  });
  return error ? { ok: false, error: formErrorOf(error) } : { ok: true };
}

/** Şifremi unuttum 3. adım: yeni şifre (kurtarma oturumu gerekir). */
export async function updatePasswordAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return notConfigured();
  const parsed = newPasswordSchema.safeParse({ password: formData.get("password") ?? "", confirm: formData.get("confirm") ?? "" });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { formError: "sessionMissing" };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { formError: formErrorOf(error) };
  redirect("/");
}

/** Çıkış Yap: yalnızca bu cihazdaki oturumu kapatır (FR-AUTH-006, Pages "Oturumu bu cihazda sonlandır"). */
export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope: "local" });
  }
  redirect(SIGN_IN_PATH);
}
