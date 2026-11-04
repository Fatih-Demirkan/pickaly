import { cn } from "@/lib/cn";

/** Yükleniyor göstergesi (DESIGN §9.3). Dekoratiftir; durumu aria-busy veya bir status metni anlatır. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-20 animate-spin rounded-full border-2 border-current border-t-transparent", className)}
    />
  );
}
