import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";
import { cache } from "react";
import { createSupabaseServerClient } from "./server";

// Supabase veri erişimi için ortak yardımcılar (feature'ların data/supabase-repository.ts dosyaları kullanır).
// Sorgular oturumdaki kullanıcının yetkisiyle çalışır; satır erişimini RLS sınırlar (TECH_STACK §6).

/** İstek başına tek Supabase istemcisi. */
export const db = cache(createSupabaseServerClient);

/** Benzersizlik kuralı ihlali (Postgres 23505): aynı kayıt zaten var (ör. tekrar üretiminin iki kez çalışması). */
export class DuplicateRecordError extends Error {}

/**
 * Supabase yanıtını açar; hata varsa fırlatır. Veritabanı tipleri henüz üretilmediği için (supabase gen types)
 * veri `unknown` döner; her repository kendi satır tipine dönüştürür.
 */
export function unwrap(result: { data: unknown; error: PostgrestError | null }): unknown {
  if (result.error) {
    if (result.error.code === "23505") throw new DuplicateRecordError(result.error.message);
    throw new Error(`[Supabase] ${result.error.message}`);
  }
  return result.data;
}

/** bigint sütunları PostgREST'ten sayı olarak gelir (tutarlar 2^53 sınırının çok altındadır). */
export function toBigInt(value: number | string): bigint {
  return BigInt(value);
}

export function toBigIntOrNull(value: number | string | null | undefined): bigint | null {
  return value === null || value === undefined ? null : BigInt(value);
}

/** Yazarken bigint metin olarak gönderilir (JSON bigint'i taşımaz). */
export function fromBigInt(value: bigint): string;
export function fromBigInt(value: bigint | null): string | null;
export function fromBigInt(value: bigint | null): string | null {
  return value === null ? null : value.toString();
}

/** Postgres'te 0001-01-01'den önceki tarih yoktur; "tüm zamanlar" aralıkları buna kırpılır. */
export function clampDate(date: string): string {
  return date < "0001-01-01" ? "0001-01-01" : date;
}
