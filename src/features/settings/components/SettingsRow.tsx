import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";

// Profil ve Ayarlar satırı (Pages "Item" yapısı) — görünüm DESIGN_SYSTEM_PICKALY §5.3 ayar satırı:
//   64 px, yatay 16, aralık 12; 36 px ikon karosu (slate, radius-sm, ikon 20) · başlık body-strong + açıklama caption
//   text-secondary · sağda değer (caption-strong) veya çip · chevron-right 16. "Çıkış Yap": ikon karosu red, başlık danger.
// Satırlar bir liste grubunda (beyaz, radius-md, elev-1) border-subtle ayraçlarla dizilir. Grup başlığı micro, BÜYÜK HARF.
// Kart içeriği kırpmaz
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

export const rowClass = "flex min-h-64 w-full items-center gap-12 px-16 py-12 text-start";
export const interactiveRowClass = "transition-colors hover:bg-surface-page focus-visible:bg-surface-page";

export function SettingsRowContent({ icon, title, hint, trailing, danger, chevron = true }: SettingsRowContentProps) {
  return (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-12">
        <span
          aria-hidden
          className={cn("inline-flex size-36 shrink-0 items-center justify-center rounded-sm", danger ? "bg-category-red text-category-fg-red" : "bg-category-slate text-category-fg-slate")}
        >
          <Icon icon={icon} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className={cn("text-body-strong", danger ? "text-text-danger" : "text-text-primary")}>{title}</span>
          <span className="text-caption text-text-secondary">{hint}</span>
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
  return <span className={cn("shrink-0 text-caption-strong", muted ? "text-text-secondary" : "text-text-primary")}>{children}</span>;
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
      <h2 id={id} className="text-micro text-text-secondary uppercase">
        {title}
      </h2>
      <ul className="divide-y divide-border-subtle rounded-md bg-surface-card shadow-elev-1 [&>li:first-child_[data-settings-row]]:rounded-t-md [&>li:last-child_[data-settings-row]]:rounded-b-md">
        {children}
      </ul>
    </section>
  );
}
