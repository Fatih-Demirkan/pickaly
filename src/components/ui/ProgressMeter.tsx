import { cn } from "@/lib/cn";

// DESIGN_SYSTEM.md §A8 "Progress meter" + DESIGN_SYSTEM_PICKALY §5.2 (Birikim Hedefi): noktalı iz.
//   Dolu noktalar blue.500 (progress-fill), boş noktalar blue.300 %40 (progress-track); ilerleme ucunda knob
//   (12 px blue.500 + 4 px blue.200 hale). Nokta 6 px, iz yüksekliği 16, noktalar satıra eşit dağılır.
// Ana Sayfa Birikim Hedefi kartı ve Birikimler ekranları (liste kartı, hesap detayı) aynı göstergeyi kullanır
// (ürün sahibi kararı 2026-11-05: basit çubuk §5.9 yerine). Yüzde her zaman metin olarak da yazılır.
// Kaplayan bağlantı içinde de kullanılabilsin diye yalnızca <span> öğelerinden oluşur.

const DOTS = 28;

type ProgressMeterProps = {
  /** 0–100; dışındaki değerler sınırlanır. */
  percent: number;
  /** Ekran okuyucu adı. */
  label: string;
  className?: string;
};

export function ProgressMeter({ percent, label, className }: ProgressMeterProps) {
  const value = Math.round(Math.max(0, Math.min(100, percent)));
  const filled = Math.round((value / 100) * DOTS);

  return (
    <span role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className={cn("flex h-16 w-full items-center justify-between", className)}>
      {Array.from({ length: DOTS }, (_, index) => {
        const knob = filled > 0 && index === filled - 1;
        return (
          <span
            key={index}
            aria-hidden
            className={cn(
              "shrink-0 rounded-full",
              knob ? "size-12 bg-progress-fill shadow-[0_0_0_4px_var(--color-progress-halo)]" : "size-6",
              !knob && (index < filled ? "bg-progress-fill" : "bg-progress-track/40"),
            )}
          />
        );
      })}
    </span>
  );
}
