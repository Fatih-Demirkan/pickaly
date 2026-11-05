"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { inputClass } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import type { AuthErrorKey, AuthFormError } from "../schemas";

// Oturum formlarının ortak alanları. Form alanı kalıbı diğer formlarla aynı (src/components/ui/field.ts: 48 px,
// radius-md, border-control; body-strong etiket, caption hata metni). Başlık display-hero (DESIGN_SYSTEM_PICKALY §3.2).


type FieldProps = Omit<ComponentProps<"input">, "id" | "name"> & {
  id: string;
  label: string;
  error?: AuthErrorKey;
  errorValues?: Record<string, number>;
  hint?: string;
};

export function TextField({ id, label, error, errorValues, hint, className, ...rest }: FieldProps) {
  const t = useTranslations("auth.errors");
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-8">
      <label htmlFor={id} className="text-body-strong text-text-primary">
        {label}
      </label>
      <input id={id} name={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(inputClass, className)} {...rest} />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-caption text-text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-caption text-text-danger">
          {t(error, errorValues)}
        </p>
      )}
    </div>
  );
}

/** Şifre alanı: göster / gizle butonuyla (göz ikonu yerine metin; [Varsayım] ikon seti eye içermiyor). */
export function PasswordField({ id, label, error, errorValues, hint, ...rest }: FieldProps) {
  const t = useTranslations("auth");
  const tErrors = useTranslations("auth.errors");
  const [visible, setVisible] = useState(false);
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-8">
      <label htmlFor={id} className="text-body-strong text-text-primary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(inputClass, "pe-72")}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          aria-controls={id}
          className="touch-target absolute end-8 top-1/2 -translate-y-1/2 rounded-sm px-8 text-caption-strong text-text-brand hover:underline"
        >
          {visible ? t("hidePassword") : t("showPassword")}
        </button>
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-caption text-text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-caption text-text-danger">
          {tErrors(error, errorValues)}
        </p>
      )}
    </div>
  );
}

export function FormAlert({ error, tone = "error", children }: { error?: AuthFormError; tone?: "error" | "info"; children?: ReactNode }) {
  const t = useTranslations("auth.formErrors");
  if (!error && !children) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-8 rounded-lg p-16 text-body text-text-primary",
        tone === "error" ? "bg-status-danger-subtle [&>span:first-child]:text-text-on-danger" : "bg-status-info-subtle [&>span:first-child]:text-text-info",
      )}
    >
      <span className="mt-2 shrink-0">
        <Icon icon="info" size="sm" />
      </span>
      <span>{children ?? (error && t(error))}</span>
    </p>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-display-hero text-text-primary">{title}</h1>
      {subtitle && <p className="text-body text-text-secondary">{subtitle}</p>}
    </div>
  );
}
