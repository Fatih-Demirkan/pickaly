import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CategoryIcon, type Category } from "@/features/categories";
import { getCategoryMap } from "@/features/categories/server";
import type { Transaction } from "@/features/transactions";
import { signedAmount } from "@/features/transactions/domain/summary";
import { detailHref } from "@/features/transactions/routes";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatDayMonth, toDateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

// Ana Sayfa → "İşlemler" (ürün sahibi isteği 2026-11-05): en son 3 işlem, yan yana 3 küçük kart; "Tümü" İşlemler'e gider.
// [Türetme] Kart: DESIGN_SYSTEM.md §A8 stat kartı ölçüleri (radius-md, padding 12, 3'lü ızgara, gap 8) + işlem satırı
//   içeriği (DESIGN_SYSTEM_PICKALY §5.3): 36 px kategori ikon karosu · başlık body-strong · tutar body-strong.
//   Beyaz zemin + elev-1 (§5.2 standart kart); renkli stat kartı zemini gelir/gider anlamı taşıdığı için kullanılmadı.
// Gelir / gider ayrımı: tutar işareti ve rengi (PRD UX-014: gelir "+" success, gider "−" danger) ve yazılı tür etiketi
//   ("Gelir" / "Gider"); renk tek başına anlam taşımaz.
// Dar ekranda büyük tutar sığmazsa "₺" alt satıra iner; sayı bölünmez ve kısaltılmaz.
// Bölüm başlığı Bugünün Akışı ile aynı (SectionHeader). İşlem yoksa kısa mesaj (RESPONSIVE §8.2.6).

const RECENT_COUNT = 3;

const UNKNOWN_CATEGORY: Pick<Category, "icon" | "color" | "type"> = { icon: null, color: "slate", type: "expense" };

type RecentTransactionsProps = { transactions: Transaction[]; locale: Locale };

export async function RecentTransactions({ transactions, locale }: RecentTransactionsProps) {
  const [t, categories] = await Promise.all([getTranslations("dashboard.transactions"), getCategoryMap()]);
  const recent = [...transactions].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, RECENT_COUNT);

  return (
    <section aria-labelledby="recent-transactions-title" className="flex flex-col gap-12">
      <SectionHeader id="recent-transactions-title" icon="transactions" title={t("title")} link={{ href: "/islemler", label: t("all") }} />
      {recent.length === 0 ? (
        <p className="rounded-md bg-surface-card p-12 text-body text-text-secondary shadow-elev-1">{t("empty")}</p>
      ) : (
        <ul className="grid grid-cols-3 gap-8">
          {recent.map((transaction) => {
            const income = transaction.type === "income";
            return (
              <li key={transaction.id} className="flex min-w-0">
                <Link
                  href={detailHref(transaction.id, {})}
                  className="flex min-w-0 flex-1 flex-col gap-8 rounded-md bg-surface-card p-12 shadow-elev-1 transition-colors hover:bg-action-tertiary-hover"
                >
                  <CategoryIcon category={categories.get(transaction.categoryId) ?? UNKNOWN_CATEGORY} />
                  <span className="flex min-w-0 flex-col gap-2">
                    <span className="truncate text-body-strong text-text-primary">{transaction.title}</span>
                    <span className={cn("text-body-strong", income ? "text-text-success" : "text-text-danger")}>
                      {formatMoney(signedAmount(transaction), locale, "always")}
                    </span>
                    <span className="truncate text-caption text-text-secondary">
                      <span className={cn("text-caption-strong", income ? "text-text-success" : "text-text-danger")}>{t(income ? "income" : "expense")}</span>
                      {" · "}
                      {formatDayMonth(toDateKey(new Date(transaction.occurredAt)), locale)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
