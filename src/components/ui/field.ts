// DESIGN_SYSTEM_PICKALY.md §5.7 Form elemanları (Karar K-7).
// Input / select tetikleyici: 48 px, radius-md, beyaz zemin, 1 px border-control (3:1, WCAG 1.4.11),
// yatay 16, metin body, placeholder text-secondary. Hover: siyah çerçeve. Hata: border-error.
// Disabled: surface-disabled + text-disabled.
// Odak (ürün sahibi isteği 2026-11-05): TEK çerçeve. Global odak halkası (globals.css, 2 px + 2 px boşluk) form
// alanlarında kapatılır; yerine alanın kendi çerçevesi blue.600 olur ve 1 px iç halka ile 2 px kalınlığa çıkar.
// Böylece dışta ikinci bir çerçeve oluşmaz; odak görünürlüğü korunur (5,6:1).

/** Form alanının tek odak durumu: kendi çerçevesi mavi + 1 px halka; global dış halka kapalı. */
export const fieldFocusClass = "focus:border-border-focus focus:ring-1 focus:ring-border-focus focus-visible:outline-none";

const fieldBase =
  "h-48 w-full rounded-md border bg-surface-card px-16 text-body text-text-primary transition-colors hover:border-border-control-hover disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-disabled disabled:text-text-disabled";

/** Tek satırlık metin input'u. Hata durumu aria-invalid ile. */
export const inputClass = `${fieldBase} ${fieldFocusClass} border-border-control placeholder:text-text-secondary aria-invalid:border-border-error`;

/** Input'u saran kutu (önek/sonek içeren tutar alanları): odak kutunun kendi çerçevesinde gösterilir. */
export function fieldBoxClass(invalid: boolean) {
  return `flex cursor-text items-center gap-8 ${fieldBase} focus-within:border-border-focus focus-within:ring-1 focus-within:ring-border-focus ${invalid ? "border-border-error" : "border-border-control"}`;
}

/** Textarea: input stili, en az 96 px, dikey 12. */
export const textareaClass = `${inputClass} h-auto min-h-96 resize-y py-12`;

// Tutar alanı (Yeni İşlem, Birikim, Para Hareketi). DESIGN_SYSTEM_PICKALY §5.7: standart beyaz kart içinde ortalı,
// çerçevesiz display-balance tutar (DS Balance header tipografisi). Odakta kutunun etrafında tek 2 px mavi halka
// (boşluksuz); hata durumunda kutunun altında 2 px kırmızı çizgi (renk tek başına değil, hata metni de var).

/** Tutar kartı kabı. */
export const amountCardClass = "flex flex-col items-center gap-12 rounded-lg bg-surface-card p-16 shadow-elev-1";

/** Tutar input'unu saran kutu: işaret, input ve birim. */
export function amountBoxClass(invalid: boolean) {
  return `flex max-w-full cursor-text items-baseline justify-center gap-4 rounded-md border-b-2 px-12 py-4 text-display-balance focus-within:ring-2 focus-within:ring-border-focus ${invalid ? "border-border-error" : "border-transparent"}`;
}

/** Tutar input'u. */
export const amountInputClass = "min-w-[4ch] bg-transparent text-center outline-none field-sizing-content placeholder:text-text-tertiary";

/** Tutar kartındaki tür çipi ("Gider Çıkışı" vb.): durum chip ölçüsü. */
export const amountChipClass = "inline-flex h-24 items-center gap-4 rounded-full px-8 text-caption-strong";
