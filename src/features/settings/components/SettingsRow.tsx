import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";

// Pages → Profil ve Ayarlar satırı ("Item"): padding 12, aralık 8; 40 px ikon kutusu (Category/Slate, radius-md, ikon 20)
//   başlık Label/Default + açıklama Body/Small text-secondary · sağda değer (Label/Small) veya çip · chevron-right 16.
//   "Çıkış Yap": ikon kutusu Category/Red, başlık Gider/Hata rengi.
// Satırlar bir grup kartında (surface-card, border-default, radius-lg) ayırıcı çizgilerle dizilir. Kart içeriği kırpmaz
// (overflow-hidden yok): değer seçicinin popover'ı kartın dışına taşabilmeli. Hover zemini ilk / son satırda köşeye uyar.

export type SettingsRowContentProps = {
  icon: AppIconName;
  title: string;
  hint: string;
  trailing?: ReactNode;
  danger?: boolean;
  /** Sağdaki chevron: satır bir ekrana veya seçiciye gidiyorsa. */
  chevron?: boolean;
};

export const rowClass = "flex w-full items-center gap-8 p-12 text-start";
export const interactiveRowClass = "transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted";

export function SettingsRowContent({ icon, title, hint, trailing, danger, chevron = true }: SettingsRowContentProps) {
  return (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-12">
        <span
          aria-hidden
          className={cn("inline-flex size-40 shrink-0 items-center justify-center rounded-md", danger ? "bg-category-red text-text-danger" : "bg-category-slate text-text-primary")}
        >
          <Icon icon={icon} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className={cn("text-label-md", danger ? "text-text-danger" : "text-text-primary")}>{title}</span>
          <span className="text-body-sm text-text-secondary">{hint}</span>
        </span>
      </span>
      {trailing}
      {chevron && (
        <span aria-hidden className="shrink-0 text-text-secondary">
          <Icon icon="next" size="sm" />
        </span>
      )}
    </>
  );
}

export function SettingsValue({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <span className={cn("shrink-0 text-label-sm", muted ? "text-text-secondary" : "text-text-primary")}>{children}</span>;
}

export function SettingsLinkRow({ href, ...content }: SettingsRowContentProps & { href: string }) {
  return (
    <Link href={href} data-settings-row className={cn(rowClass, interactiveRowClass)}>
      <SettingsRowContent {...content} />
    </Link>
  );
}

/** Henüz kullanılamayan satır (ekranı tasarlanmamış veya ertelenmiş): görünür, devre dışı, nedeni ekran okuyucuya okunur. */
export function SettingsDisabledRow({ describedBy, ...content }: SettingsRowContentProps & { describedBy: string }) {
  return (
    <button type="button" disabled aria-describedby={describedBy} data-settings-row className={cn(rowClass, "cursor-not-allowed")}>
      <SettingsRowContent {...content} />
    </button>
  );
}

/** Bilgi amaçlı satır (ör. Para Birimi, FR-SET-004): etkileşim yok, chevron yok. */
export function SettingsStaticRow(content: SettingsRowContentProps) {
  return (
    <div className={rowClass}>
      <SettingsRowContent {...content} chevron={false} />
    </div>
  );
}

export function SettingsGroup({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-8">
      <h2 id={id} className="text-label-sm text-text-secondary uppercase">
        {title}
      </h2>
      <ul className="divide-y divide-border-default rounded-lg border border-border-default bg-surface-card [&>li:first-child_[data-settings-row]]:rounded-t-lg [&>li:last-child_[data-settings-row]]:rounded-b-lg">
        {children}
      </ul>
    </section>
  );
}
