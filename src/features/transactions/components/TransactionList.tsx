import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import type { Account } from "@/features/accounts";
import { CategoryIcon, categoryChipClass, type Category } from "@/features/categories";
import { cn } from "@/lib/cn";
import { formatDayMonth, formatTime, type DateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { Locale } from "@/i18n/config";
import { signedAmount, type DayGroup } from "../domain/summary";
import type { Transaction } from "../domain/types";
import { detailHref, type ListQuery } from "../routes";
import { TransactionRowLink } from "./TransactionRowLink";

// Pages → İşlemler gün grupları.
//   Gün başlığı: Heading/H4 ("Bugün, 14 Mayıs") + Label/Small text-secondary ("Net: +6.570,00 ₺")
//   Liste kartı: radius-lg, surface-card, border-default, iç boşluk yok
//   Satır: padding 12, aralık 12, alt çizgi; ikon kutusu 40; başlık Label/Default; altında kategori chip'i
//          + "•" + hesap (Body/Small); sağda tutar Label/Default (gelir success / gider danger) ve saat (Body/Small)
// Laptop+: sütunlu liste-tablo hibriti, semantik <table> (RESPONSIVE §3.3.1, §4.2).
// ≥1280'de detay paneli sağa sabitlenince (<html data-docked-drawer>) liste daralır; tablo yerine satır kartları döner.
// Seçili satır adresten işaretlenir (TransactionRowLink), liste seçim için yeniden çizilmez.
// Durum: "Ödendi olarak işaretle" ile oluşan giderlerde "Ödendi" çipi (PRD FR-FIN-018; Figma Chip → Yeşil).
// [Varsayım] Mobil satırda çip başlığın yanında; Pages listesinde durum çipi örneği yok.

type TransactionListProps = {
  groups: DayGroup[];
  categories: Map<string, Category>;
  accounts: Map<string, Account>;
  locale: Locale;
  today: DateKey;
  query: ListQuery;
};

const UNKNOWN_CATEGORY: Category = { id: "", type: "expense", name: "—", icon: null, color: "slate", archived: false };

function amountClass(transaction: Transaction) {
  return transaction.type === "income" ? "text-text-success" : "text-text-danger";
}

export async function TransactionList({ groups, categories, accounts, locale, today, query }: TransactionListProps) {
  const t = await getTranslations("transactions.list");

  const heading = (date: DateKey) => (date === today ? t("todayHeading", { date: formatDayMonth(date, locale) }) : formatDayMonth(date, locale));

  return (
    <div className="flex flex-col gap-(--layout-section-gap)">
      {groups.map((group) => {
        const headingId = `day-${group.date}`;
        return (
          <section key={group.date} aria-labelledby={headingId} className="flex flex-col gap-12">
            <div className="flex items-baseline justify-between gap-12">
              <h2 id={headingId} className="text-heading-h4 text-text-primary">
                {heading(group.date)}
              </h2>
              <p className="text-label-sm text-text-secondary">{t("dayNet", { amount: formatMoney(group.netMinor, locale, "always") })}</p>
            </div>

            {/* Mobil / tablet (ve ≥1280 detay paneli açıkken): satır kartları */}
            <ul className="overflow-hidden rounded-lg border border-border-default bg-surface-card laptop:hidden detail:[html[data-docked-drawer]_&]:block">
              {group.transactions.map((transaction) => {
                const category = categories.get(transaction.categoryId) ?? UNKNOWN_CATEGORY;
                return (
                  <li key={transaction.id} className="border-b border-border-default last:border-b-0">
                    <TransactionRowLink
                      id={transaction.id}
                      href={detailHref(transaction.id, query)}
                      className="flex items-center gap-12 p-12 transition-colors hover:bg-surface-page aria-[current]:bg-surface-selected"
                    >
                      <CategoryIcon category={category} />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <span className="flex min-w-0 items-center gap-8">
                          <span className="truncate text-label-md text-text-primary">{transaction.title}</span>
                          {transaction.source === "payment" && <Chip variant="success">{t("paid")}</Chip>}
                        </span>
                        <span className="flex min-w-0 items-center gap-8 text-body-sm text-text-secondary">
                          <span className={cn("inline-flex h-24 shrink-0 items-center rounded-full px-8 text-label-sm", categoryChipClass(category.color))}>
                            {category.name}
                          </span>
                          <span aria-hidden>•</span>
                          <span className="truncate">{accounts.get(transaction.accountId)?.name}</span>
                        </span>
                      </div>
                      <div className="flex shrink-0 flex-col items-end">
                        <span className={cn("text-label-md", amountClass(transaction))}>{formatMoney(signedAmount(transaction), locale, "always")}</span>
                        <span className="text-body-sm text-text-secondary">{formatTime(transaction.occurredAt, locale)}</span>
                      </div>
                    </TransactionRowLink>
                  </li>
                );
              })}
            </ul>

            {/* Laptop+: liste-tablo hibriti */}
            <div className="hidden overflow-hidden rounded-lg border border-border-default bg-surface-card laptop:block detail:[html[data-docked-drawer]_&]:hidden">
                <table className="w-full table-fixed border-collapse text-start">
                  <caption className="sr-only">{heading(group.date)}</caption>
                  {/* Başlık satırı yalnızca ekran okuyucu için olduğundan sütun genişlikleri colgroup ile verilir. */}
                  <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[18%]" />
                    <col className="w-[14%]" />
                    <col className="w-[12%]" />
                    <col className="w-[8%]" />
                    <col className="w-[16%]" />
                  </colgroup>
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">{t("columns.transaction")}</th>
                      <th scope="col">{t("columns.category")}</th>
                      <th scope="col">{t("columns.account")}</th>
                      <th scope="col">{t("columns.status")}</th>
                      <th scope="col">{t("columns.time")}</th>
                      <th scope="col">{t("columns.amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.transactions.map((transaction) => {
                      const category = categories.get(transaction.categoryId) ?? UNKNOWN_CATEGORY;
                      const href = detailHref(transaction.id, query);
                      return (
                        <tr key={transaction.id} className="relative border-b border-border-default transition-colors last:border-b-0 hover:bg-surface-page has-[a[aria-current]]:bg-surface-selected">
                          <th scope="row" className="p-12 text-start font-normal">
                            {/* Satırın tamamı tıklanabilir: bağlantı ilk hücrede, ::after ile satırı kaplar. */}
                            <TransactionRowLink id={transaction.id} href={href} className="flex min-w-0 items-center gap-12 after:absolute after:inset-0 after:content-['']">
                              <CategoryIcon category={category} />
                              <span className="truncate text-label-md text-text-primary">{transaction.title}</span>
                            </TransactionRowLink>
                          </th>
                          <td className="p-12">
                            <span className={cn("inline-flex h-24 max-w-full items-center truncate rounded-full px-8 text-label-sm", categoryChipClass(category.color))}>
                              {category.name}
                            </span>
                          </td>
                          <td className="truncate p-12 text-body-sm text-text-secondary">{accounts.get(transaction.accountId)?.name}</td>
                          <td className="p-12">{transaction.source === "payment" && <Chip variant="success">{t("paid")}</Chip>}</td>
                          <td className="p-12 text-body-sm text-text-secondary">{formatTime(transaction.occurredAt, locale)}</td>
                          <td className={cn("p-12 text-end text-label-md", amountClass(transaction))}>{formatMoney(signedAmount(transaction), locale, "always")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
