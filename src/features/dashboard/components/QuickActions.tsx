import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";

// Pages → Ana Sayfa "Section - 2. Hızlı Aksiyonlar (Minimalist Bar)" (6:1935, PRD FR-DSH-003, RESPONSIVE §3.1).
//   Buton: surface-card, border-subtle, radius-lg, dikey padding 12, aralık 8, Shadow/SM; 40 px kategori renkli ikon
//   kutusu (radius-md) + Label/Small. Mobil/tablet 4'lü satır, laptop+ 2×2.
// Hedefler [Karar #2, #3]: Gelir → Yeni İşlem/Gelir · Gider → /Gider · Ödeme → /Abonelik · Görev → Görev Ekle.
// Görev Ekle formu Pages'ta tasarlanmadı; RESPONSIVE §8.2.1 önerisiyle Takvim modülünde kuruldu.
// [Varsayım] İkon renkleri ölçülmedi; kutu zeminiyle aynı ailenin koyu tonları.

type Action = { key: "income" | "expense" | "task" | "payment"; icon: AppIconName; tone: string; href?: string };

const actions: Action[] = [
  { key: "income", icon: "add", tone: "bg-category-green text-status-success", href: "/islemler/yeni?tur=gelir" },
  { key: "expense", icon: "subtract", tone: "bg-category-red text-status-danger", href: "/islemler/yeni?tur=gider" },
  { key: "task", icon: "task", tone: "bg-category-blue text-text-on-task", href: "/takvim/yeni?tur=gorev" },
  { key: "payment", icon: "payment", tone: "bg-category-orange text-text-warning", href: "/islemler/yeni?tur=abonelik" },
];

const itemClass =
  "touch-target flex min-w-0 flex-1 flex-col items-center justify-center gap-8 rounded-lg border border-border-subtle bg-surface-card px-4 py-12 shadow-sm transition-colors";

export async function QuickActions() {
  const [t, tHeader] = await Promise.all([getTranslations("dashboard.quick"), getTranslations("header")]);

  return (
    <nav aria-label={t("label")}>
      <ul className="grid grid-cols-4 gap-8 laptop:grid-cols-2">
        {actions.map((action) => {
          const content = (
            <>
              <span aria-hidden className={cn("inline-flex size-40 items-center justify-center rounded-md", action.tone)}>
                <Icon icon={action.icon} />
              </span>
              <span className="truncate text-label-sm text-text-primary">{t(action.key)}</span>
            </>
          );
          return (
            <li key={action.key} className="flex">
              {action.href ? (
                <Link href={action.href} scroll={false} className={cn(itemClass, "hover:border-border-strong")}>
                  {content}
                </Link>
              ) : (
                <button type="button" disabled aria-describedby="quick-unavailable" className={cn(itemClass, "cursor-not-allowed opacity-60")}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <span id="quick-unavailable" className="sr-only">
        {tHeader("unavailable")}
      </span>
    </nav>
  );
}
