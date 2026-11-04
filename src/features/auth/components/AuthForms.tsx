"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  requestResetAction,
  resendResetCodeAction,
  resendSignUpCodeAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
  verifyResetAction,
  verifySignUpAction,
} from "../actions";
import { RESET_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from "../routes";
import { NAME_MAX_LENGTH, PASSWORD_MIN_LENGTH, type AuthFormError, type AuthFormState } from "../schemas";
import { FormAlert, PasswordField, TextField } from "./AuthFields";
import { OtpInput } from "./OtpInput";

// Oturum formları (RESPONSIVE §8.2.8 [Varsayım]). Ana buton Button LG Primary, tam genişlik; ikincil bağlantılar Label/Small brand.

const linkClass = "text-label-md text-text-brand hover:underline";
const RESEND_SECONDS = 60; // [Varsayım] Kodu tekrar gönder geri sayımı (FR-AUTH-002).

export function SignInForm({ next, initialError }: { next: string; initialError?: AuthFormError }) {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signInAction, initialError ? { formError: initialError } : {});

  return (
    <form action={action} noValidate className="flex flex-col gap-16">
      <input type="hidden" name="next" value={next} />
      <FormAlert error={state.formError} />
      <TextField id="email" label={t("fields.email")} type="email" autoComplete="email" inputMode="email" defaultValue={state.values?.email} error={state.errors?.email} required />
      <PasswordField id="password" label={t("fields.password")} autoComplete="current-password" error={state.errors?.password} required />
      <Link href={RESET_PATH} className={`${linkClass} self-end`}>
        {t("signIn.forgot")}
      </Link>
      <Button type="submit" fullWidth loading={pending}>
        {t("signIn.submit")}
      </Button>
      <p className="text-center text-body-md text-text-secondary">
        {t("signIn.noAccount")}{" "}
        <Link href={SIGN_UP_PATH} className={linkClass}>
          {t("signIn.createAccount")}
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signUpAction, {});

  return (
    <form action={action} noValidate className="flex flex-col gap-16">
      <FormAlert error={state.formError} />
      <TextField id="name" label={t("fields.name")} autoComplete="name" maxLength={NAME_MAX_LENGTH} defaultValue={state.values?.name} error={state.errors?.name} errorValues={{ max: NAME_MAX_LENGTH }} required />
      <TextField id="email" label={t("fields.email")} type="email" autoComplete="email" inputMode="email" defaultValue={state.values?.email} error={state.errors?.email} required />
      <PasswordField
        id="password"
        label={t("fields.password")}
        autoComplete="new-password"
        hint={t("fields.passwordHint", { min: PASSWORD_MIN_LENGTH })}
        error={state.errors?.password}
        errorValues={{ min: PASSWORD_MIN_LENGTH }}
        required
      />
      <div className="flex flex-col gap-4">
        <label className="flex items-start gap-8 text-body-md text-text-primary">
          <input
            type="checkbox"
            name="terms"
            aria-invalid={state.errors?.terms ? true : undefined}
            aria-describedby={state.errors?.terms ? "terms-error" : undefined}
            className="mt-2 size-20 shrink-0 accent-brand-primary"
          />
          {/* [Eksik] Kullanım koşulları ve gizlilik metinleri hukuki onay bekliyor (LB-01); bağlantılar metinler gelince eklenir. */}
          {t("signUp.terms")}
        </label>
        {state.errors?.terms && (
          <p id="terms-error" className="text-body-sm text-text-danger">
            {t("errors.terms")}
          </p>
        )}
      </div>
      <Button type="submit" fullWidth loading={pending}>
        {t("signUp.submit")}
      </Button>
      <p className="text-center text-body-md text-text-secondary">
        {t("signUp.haveAccount")}{" "}
        <Link href={SIGN_IN_PATH} className={linkClass}>
          {t("signUp.signIn")}
        </Link>
      </p>
    </form>
  );
}

function ResendButton({ email, kind }: { email: string; kind: "signup" | "recovery" }) {
  const t = useTranslations("auth");
  const toast = useToast();
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  return (
    <button
      type="button"
      disabled={seconds > 0 || pending}
      onClick={() =>
        startTransition(async () => {
          const result = kind === "signup" ? await resendSignUpCodeAction(email) : await resendResetCodeAction(email);
          if (result.ok) {
            toast({ message: t("verify.resent") });
            setSeconds(RESEND_SECONDS);
          } else toast({ message: t(`formErrors.${result.error ?? "unknown"}`), tone: "error" });
        })
      }
      className="touch-target self-center text-label-md text-text-brand hover:underline disabled:cursor-not-allowed disabled:text-text-tertiary disabled:no-underline"
    >
      {seconds > 0 ? t("verify.resendIn", { seconds }) : t("verify.resend")}
    </button>
  );
}

function CodeForm({ email, next, kind }: { email: string; next?: string; kind: "signup" | "recovery" }) {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<AuthFormState, FormData>(kind === "signup" ? verifySignUpAction : verifyResetAction, {});
  const errorId = state.errors?.code ? "code-error" : undefined;

  return (
    <form action={action} noValidate className="flex flex-col gap-16">
      <input type="hidden" name="email" value={email} />
      {next && <input type="hidden" name="next" value={next} />}
      <FormAlert error={state.formError} />
      <OtpInput name="code" label={t("verify.codeLabel")} digitLabel={(index) => t("verify.digit", { index })} invalid={Boolean(state.errors?.code || state.formError === "codeInvalid")} describedBy={errorId} />
      {state.errors?.code && (
        <p id="code-error" className="text-body-sm text-text-danger">
          {t("errors.code")}
        </p>
      )}
      <Button type="submit" fullWidth loading={pending}>
        {t("verify.submit")}
      </Button>
      <ResendButton email={email} kind={kind} />
    </form>
  );
}

export function VerifySignUpForm({ email, next }: { email: string; next?: string }) {
  return <CodeForm email={email} next={next} kind="signup" />;
}

export function ResetRequestForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<AuthFormState, FormData>(requestResetAction, {});
  return (
    <form action={action} noValidate className="flex flex-col gap-16">
      <FormAlert error={state.formError} />
      <TextField id="email" label={t("fields.email")} type="email" autoComplete="email" inputMode="email" defaultValue={state.values?.email} error={state.errors?.email} required />
      <Button type="submit" fullWidth loading={pending}>
        {t("reset.send")}
      </Button>
      <Link href={SIGN_IN_PATH} className={`${linkClass} self-center`}>
        {t("reset.backToSignIn")}
      </Link>
    </form>
  );
}

export function ResetCodeForm({ email }: { email: string }) {
  return <CodeForm email={email} kind="recovery" />;
}

export function NewPasswordForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<AuthFormState, FormData>(updatePasswordAction, {});
  return (
    <form action={action} noValidate className="flex flex-col gap-16">
      <FormAlert error={state.formError} />
      <PasswordField
        id="password"
        label={t("fields.newPassword")}
        autoComplete="new-password"
        hint={t("fields.passwordHint", { min: PASSWORD_MIN_LENGTH })}
        error={state.errors?.password}
        errorValues={{ min: PASSWORD_MIN_LENGTH }}
        required
      />
      <PasswordField id="confirm" label={t("fields.confirmPassword")} autoComplete="new-password" error={state.errors?.confirm} required />
      <Button type="submit" fullWidth loading={pending}>
        {t("reset.save")}
      </Button>
      {state.formError === "sessionMissing" && (
        <Link href={RESET_PATH} className={`${linkClass} self-center`}>
          {t("reset.restart")}
        </Link>
      )}
    </form>
  );
}
