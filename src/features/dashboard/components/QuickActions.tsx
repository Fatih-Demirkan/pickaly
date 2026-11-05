import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";

// Pages → Ana Sayfa "Section - 2. Hızlı Aksiyonlar (Minimalist Bar)" (6:1935, PRD FR-DSH-003, RESPONSIVE §3.1).
//   Kart (DESIGN_SYSTEM_PICKALY §5.2): beyaz, radius-md, dikey padding 12, aralık 8, elev-1; 36 px kategori renkli ikon
//   karosu (radius-sm) + caption-strong. Renkler: Gelir green · Gider red · Görev violet · Ödeme pink. Her boyutta 4 sütun (laptop+ İşlemler ile aynı 7/12 sütunda).
// Hedefler [Karar #2, #3]: hepsi Yeni İşlem sheet'i, aynı sırada sekme: Gelir · Gider · Görev · Ödeme (= Abonelik)
// (ürün sahibi kararı 2026-11-05). Görev sekmesi Takvim modülünün Görev Ekle formunu gösterir.
// [Varsayım] İkon renkleri ölçülmedi; kutu zeminiyle aynı ailenin koyu tonları.

type Action = { key: "income" | "expense" | "task" | "payment"; icon: AppIconName; tone: string; href?: string };

const actions: Action[] = [
  { key: "income", icon: "add", tone: "bg-category-green text-category-fg-green", href: "/islemler/yeni?tur=gelir" },
  { key: "expense", icon: "subtract", tone: "bg-category-red text-category-fg-red", href: "/islemler/yeni?tur=gider" },
  { key: "task", icon: "task", tone: "bg-category-violet text-category-fg-violet", href: "/islemler/yeni?tur=gorev" },
  { key: "payment", icon: "payment", tone: "bg-category-pink text-category-fg-pink", href: "/islemler/yeni?tur=abonelik" },
];

const itemClass =
  "touch-target flex min-w-0 flex-1 flex-col items-center justify-center gap-8 rounded-md bg-surface-card px-4 py-12 shadow-elev-1 transition-colors";

export async function QuickActions() {
  const [t, tHeader] = await Promise.all([getTranslations("dashboard.quick"), getTranslations("header")]);

  return (
    <nav aria-label={t("label")}>
      <ul className="grid grid-cols-4 gap-8">
        {actions.map((action) => {
          const content = (
            <>
              <span aria-hidden className={cn("inline-flex size-36 items-center justify-center rounded-sm", action.tone)}>
                <Icon icon={action.icon} />
              </span>
              <span className="truncate text-caption-strong text-text-primary">{t(action.key)}</span>
            </>
          );
          return (
            <li key={action.key} className="flex">
              {action.href ? (
                <Link href={action.href} scroll={false} className={cn(itemClass, "hover:bg-action-tertiary-hover")}>
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
