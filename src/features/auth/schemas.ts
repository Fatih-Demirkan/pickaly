import { z } from "zod";

// Oturum formlarının doğrulama kuralları (PRD FR-AUTH-001…004). Şifre en az 8 karakter (Supabase Auth ayarı, S-5).

export const PASSWORD_MIN_LENGTH = 8;
export const NAME_MAX_LENGTH = 60;
export const OTP_LENGTH = 6;

const email = z.string().trim().toLowerCase().email("email");
const password = z.string().min(PASSWORD_MIN_LENGTH, "passwordLength");
const code = z.string().trim().regex(/^\d{6}$/, "code");

export const signInSchema = z.object({ email, password: z.string().min(1, "password") });
export const signUpSchema = z.object({
  name: z.string().trim().min(1, "name").max(NAME_MAX_LENGTH, "nameLength"),
  email,
  password,
  terms: z.literal("on", "terms"),
});
export const verifySchema = z.object({ email, code });
export const resetRequestSchema = z.object({ email });
export const newPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((value) => value.password === value.confirm, { message: "mismatch", path: ["confirm"] });

export type AuthField = "name" | "email" | "password" | "confirm" | "terms" | "code";
export type AuthErrorKey =
  | "email"
  | "password"
  | "passwordLength"
  | "name"
  | "nameLength"
  | "terms"
  | "code"
  | "mismatch";
export type AuthFormError =
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "codeInvalid"
  | "rateLimited"
  | "weakPassword"
  | "samePassword"
  | "sessionMissing"
  | "notConfigured"
  | "unknown";

export type AuthFormState = {
  errors?: Partial<Record<AuthField, AuthErrorKey>>;
  formError?: AuthFormError;
  /** Başarılı ama sayfada kalınan durumlar (ör. kod yeniden gönderildi). */
  notice?: "codeSent";
  values?: { email?: string; name?: string };
};
