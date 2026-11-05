import { cn } from "@/lib/cn";

// Alt görev ilerleme barı (DESIGN_SYSTEM_PICKALY §5.9 basit ilerleme çubuğu): iz blue.100, dolgu blue.500, tam yuvarlak.
// Sayaç her zaman metin olarak da yazılır ("2/5"); renk tek başına anlam taşımaz.
//   size "md": detay ve form (8 px, üstte etiket + sayaç) · "sm": takvim / Ana Sayfa kartı (4 px, sağda sayaç).

type SubtaskProgressProps = { done: number; total: number; label: string; size?: "md" | "sm"; className?: string };

export function SubtaskProgress({ done, total, label, size = "md", className }: SubtaskProgressProps) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const bar = (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-valuetext={`${done}/${total}`}
      className={cn("block w-full overflow-hidden rounded-full bg-progress-track-bar", size === "md" ? "h-8" : "h-4")}
    >
      <span className="block h-full rounded-full bg-progress-fill transition-[width] motion-reduce:transition-none" style={{ width: `${percent}%` }} />
    </span>
  );

  if (size === "sm") {
    return (
      <span className={cn("flex items-center gap-8", className)}>
        {bar}
        <span className="shrink-0 text-caption-strong text-text-secondary">
          {done}/{total}
        </span>
      </span>
    );
  }

  return (
    <span className={cn("flex flex-col gap-6", className)}>
      <span className="flex items-center justify-between gap-8 text-caption">
        <span className="text-text-secondary">{label}</span>
        <span className="text-caption-strong text-text-primary">
          {done}/{total}
        </span>
      </span>
      {bar}
    </span>
  );
}
