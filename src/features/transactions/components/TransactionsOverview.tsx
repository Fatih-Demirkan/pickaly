import { getLocale, getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAccountMap } from "@/features/accounts/server";
import { getCategoryMap } from "@/features/categories/server";
import { isLocale } from "@/i18n/config";
import { toDateKey, type MonthKey } from "@/lib/dates";
import { applyFilter, groupByDay, summarize } from "../domain/summary";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { listHref, newTransactionHref, type ListQuery } from "../routes";
import { transactionRepository } from "../server";
import { SummaryCard } from "./SummaryCard";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionList } from "./TransactionList";

// İşlemler – Gelir ve Gider Listesi (Pages 113:419, RESPONSIVE §3.3.1).
// Özet kartı dönemin TÜM gerçekleşmiş işlemlerinden hesaplanır; tür / kategori filtresi yalnızca listeyi daraltır.
// Detay ve formlar bu listenin üstünde drawer olarak açılır (@drawer slot); ≥1280'de detay sağa sabitlenir.

type TransactionsOverviewProps = {
  query: ListQuery & { month: MonthKey };
};

export async function TransactionsOverview({ query }: TransactionsOverviewProps) {
  const [t, rawLocale, monthTransactions, categories, accounts] = await Promise.all([
    getTranslations("transactions"),
    getLocale(),
    transactionRepository.listByMonth(query.month),
    getCategoryMap(),
    getAccountMap(),
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const [tPage, tNav] = await Promise.all([getTranslations("pages.transactions"), getTranslations("nav")]);

  const summary = summarize(monthTransactions);
  const visible = applyFilter(monthTransactions, query);
  const groups = groupByDay(visible);

  const usedCategoryIds = new Set(applyFilter(monthTransactions, { type: query.type }).map((transaction) => transaction.categoryId));
  const filterCategories = [...categories.values()].filter((category) => usedCategoryIds.has(category.id));
  const filtered = Boolean(query.type || query.categoryId);

  const list = (
    <>
      <MonthSwitcher month={query.month} hrefFor={(month) => listHref({ ...query, month })} locale={locale} labels={{ previous: t("previousMonth"), next: t("nextMonth"), period: t("period") }} />
      <SummaryCard summary={summary} locale={locale} />
      <TransactionFilters query={query} categories={filterCategories} />

      {groups.length > 0 ? (
        <TransactionList
          groups={groups}
          categories={categories}
          accounts={accounts}
          locale={locale}
          today={toDateKey(new Date())}
          query={query}
        />
      ) : (
        // Boş durum: DESIGN_SYSTEM_PICKALY §5.9. Filtre varken aksiyon verilmez (kayıt eklemek filtreyi çözmez).
        <EmptyState
          icon="transactions"
          title={t("list.emptyTitle")}
          description={filtered ? t("list.emptyFiltered") : t("list.emptyBody")}
          action={
            filtered ? undefined : (
              <ButtonLink href={newTransactionHref("income")} scroll={false} leadingIcon="add">
                {tNav("newTransaction")}
              </ButtonLink>
            )
          }
        />
      )}

      <p className="text-caption text-text-secondary">{t("list.sampleData")}</p>
    </>
  );

  return (
    <PageContainer className="flex flex-col gap-(--layout-section-gap)">
      <PageHeader
        title={tPage("title")}
        subtitle={tPage("subtitle")}
        actions={
          <ButtonLink href={listHref({ type: query.type, categoryId: query.categoryId })} variant="tertiary" size="sm" leadingIcon="calendar">
            {t("today")}
          </ButtonLink>
        }
      />

      {list}
    </PageContainer>
  );
}
