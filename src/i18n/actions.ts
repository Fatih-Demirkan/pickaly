"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "./config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Arayüz dilini değiştirir. Şimdilik yalnızca cookie'ye yazar.
 * Auth geldiğinde: oturum varsa user_settings.language da güncellenecek (PRD FR-SET-003).
 */
export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) {
    throw new Error(`Desteklenmeyen dil: ${locale}`);
  }

  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
