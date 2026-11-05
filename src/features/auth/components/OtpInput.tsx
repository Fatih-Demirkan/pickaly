"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { fieldFocusClass } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { OTP_LENGTH } from "../schemas";

// 6 haneli e-posta kodu (RESPONSIVE §8.2.8): 6 ayrı 48×56 kutu, radius-md, border-input; rakam title-md (DESIGN_SYSTEM_PICKALY §5.7).
// Yapıştırma, geri silme ve ok tuşlarıyla gezinme desteklenir; değer tek bir gizli alanla (name) gönderilir.
// Ekran okuyucu için kutular tek bir grup olarak adlandırılır; her kutu "n. hane" etiketlidir.

type OtpInputProps = { name: string; label: string; digitLabel: (index: number) => string; invalid?: boolean; describedBy?: string };

export function OtpInput({ name, label, digitLabel, invalid, describedBy }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focus = (index: number) => refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();

  function setAt(index: number, value: string) {
    setDigits((current) => current.map((digit, position) => (position === index ? value : digit)));
  }

  function fill(from: number, text: string) {
    const chars = text.replace(/\D/g, "").slice(0, OTP_LENGTH - from).split("");
    if (chars.length === 0) return;
    setDigits((current) => current.map((digit, position) => (position >= from && position < from + chars.length ? (chars[position - from] ?? digit) : digit)));
    focus(from + chars.length);
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index]) {
      event.preventDefault();
      setAt(index - 1, "");
      focus(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focus(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focus(index + 1);
    }
  }

  function onPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    fill(index, event.clipboardData.getData("text"));
  }

  return (
    <div role="group" aria-label={label} aria-describedby={describedBy} className="flex justify-between gap-8">
      <input type="hidden" name={name} value={digits.join("")} />
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          aria-label={digitLabel(index + 1)}
          aria-invalid={invalid || undefined}
          value={digit}
          onChange={(event) => {
            const value = event.target.value.replace(/\D/g, "");
            if (value.length > 1) fill(index, value);
            else {
              setAt(index, value);
              if (value) focus(index + 1);
            }
          }}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => onPaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={cn(
            "h-56 w-48 min-w-0 rounded-md border bg-surface-card text-center text-title-md text-text-primary transition-colors",
            fieldFocusClass,
            invalid ? "border-border-error" : "border-border-input hover:border-border-input-hover",
          )}
        />
      ))}
    </div>
  );
}
