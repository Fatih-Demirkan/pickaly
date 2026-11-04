/** Koşullu sınıf adlarını birleştirir (ek bağımlılık olmadan). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
