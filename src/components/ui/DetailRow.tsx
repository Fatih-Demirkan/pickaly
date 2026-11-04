import type { ReactNode } from "react";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Pages → İşlem Detayı "Kayıt Parametreleri" ve Ödeme Detayı "Ödeme Ayrıntıları" satırı (<dl> içinde):
//   padding 16, aralık 16, border-subtle ayraç; solda 32 px ikon karosu (slate, radius-sm) + body
//   text-secondary, sağda body-strong + caption. `stacked`: değer etiketin altında (uzun not).

type DetailRowProps = { icon: AppIconName; label: string; children: ReactNode; stacked?: boolean };

export function DetailRow({ icon, label, children, stacked }: DetailRowProps) {
  return (
    <div className={cn("flex gap-16 border-b border-border-subtle p-16 last:border-b-0", stacked ? "flex-col gap-6" : "items-center justify-between")}>
      <dt className="flex min-w-0 items-center gap-12 text-body text-text-secondary">
        <span aria-hidden className="inline-flex size-32 shrink-0 items-center justify-center rounded-sm bg-category-slate text-category-fg-slate">
          <Icon icon={icon} size="sm" />
        </span>
        {label}
      </dt>
      {/* Pages'ta etiket iki satıra kırılır; değer tek satırda kalır. */}
      <dd className={cn("min-w-0", !stacked && "max-w-[60%] shrink-0 text-end whitespace-nowrap *:truncate")}>{children}</dd>
    </div>
  );
}
