import { getLocale, getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { listAccounts } from "@/features/accounts/server";
import { calendarRepository } from "@/features/calendar/server";
import { UpcomingPayments } from "@/features/payments/components/UpcomingPayments";
import { listPaymentsDueOn } from "@/features/payments/server";
import { getFeaturedGoal, listSavingsAccounts } from "@/features/savings/server";
import { summarize } from "@/features/transactions";
import { getAccountBalances, transactionRepository } from "@/features/transactions/server";
import { isLocale } from "@/i18n/config";
import { shiftMonth, toDateKey, toMonthKey } from "@/lib/dates";
import { BalanceCard } from "./BalanceCard";
import { GettingStarted } from "./GettingStarted";
import { QuickActions } from "./QuickActions";
import { RecentTransactions } from "./RecentTransactions";
import { SavingsGoalCard } from "./SavingsGoalCard";
import { TodayAgenda } from "./TodayAgenda";

// Pages → Ana Sayfa (6:1008), RESPONSIVE §3.1, PRD §4 FR-DSH.
//   Mobil sıra [Figma]: Toplam Bakiye · Hızlı Aksiyonlar · Bugünün Akışı · (ayırıcı) · Yaklaşan Ödemeler · Birikim Hedefi
//   Tablet [Karar]: Bakiye 8/8 · Hızlı Aksiyonlar 8/8 · Bugünün Akışı 4/8 | Yaklaşan Ödemeler 4/8 · Birikim Hedefi 8/8
//   Laptop+ [Karar]: Bakiye 8/12 | Birikim Hedefi 4/12 · Bugünün Akışı 7/12 | Hızlı Aksiyonlar 2×2 + Yaklaşan Ödemeler 5/12
// "İşlemler" (son 3 işlem, ürün sahibi isteği 2026-11-05): Hızlı Aksiyonların (Gelir · Gider · Görev · Ödeme) bir alt
//   sırasında (ürün sahibi isteği 2026-11-05). Mobil/tablet: Bakiye · Başlarken · Hızlı Aksiyonlar · İşlemler · Bugünün Akışı.
//   [Varsayım: yerleşim] laptop+: Hızlı Aksiyonlar 7/12 (4 sütun) · altında İşlemler 7/12 · altında Bugünün Akışı 7/12;
//   sağ sütunda Birikim Hedefi ve Yaklaşan Ödemeler.
// Görevler Takvim modülünden gelir (Bugünün Akışı, "Bugün: n Görev").
// [Eksik] Haftalık özet kartı (PRD FR-DSH-011, Q-3) ve "Sıradaki" etkinlik satırı (FR-DSH-010) tasarlanmadı.

export async function Dashboard() {
  await connection(); // Bakiye, bugünün akışı ve vadeler istek anına göre hesaplanır (cacheComponents).
  const now = new Date();
  const today = toDateKey(now);
  const currentMonth = toMonthKey(now);
  const [t, rawLocale, balances, monthTransactions, previousTransactions, dueToday, goal, todayItems, overdue, accounts, allTransactions, allItems, savings] = await Promise.all([
    getTranslations("nav"),
    getLocale(),
    getAccountBalances(),
    transactionRepository.listByMonth(currentMonth),
    transactionRepository.listByMonth(shiftMonth(currentMonth, -1)),
    listPaymentsDueOn(today),
    getFeaturedGoal(),
    calendarRepository.listBetween(today, today),
    calendarRepository.listOverdue(today),
    // "Başlarken" kartı için: kullanıcı ilk adımları attı mı?
    listAccounts(),
    transactionRepository.listAll(),
    calendarRepository.listBetween("0000-01-01", "9999-12-31"),
    listSavingsAccounts(),
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const month = summarize(monthTransactions);
  const previousMonth = summarize(previousTransactions);
  const totalMinor = [...balances.values()].reduce((sum, balance) => sum + balance, BigInt(0));
  const steps = {
    // Hesap adımı: ikinci bir hesap eklendi ya da bir hesabın bakiyesi girildi.
    account: accounts.length > 1 || accounts.some((account) => account.openingBalanceMinor !== BigInt(0)),
    transaction: allTransactions.length > 0,
    task: allItems.length > 0,
    savings: savings.length > 0,
  };

  return (
    <div className="grid grid-cols-1 gap-(--layout-section-gap) tablet:grid-cols-2 laptop:grid-cols-12">
      <h1 className="sr-only">{t("home")}</h1>
      <div className="flex flex-col gap-(--layout-section-gap) tablet:col-span-2 laptop:col-span-8 laptop:col-start-1 laptop:row-start-1">
        <BalanceCard
          totalMinor={totalMinor}
          accountCount={accounts.length}
          previousExpenseMinor={previousMonth.expenseMinor}
          month={currentMonth}
          incomeMinor={month.incomeMinor}
          expenseMinor={month.expenseMinor}
          pendingPayments={dueToday.filter(({ payment }) => payment.status === "pending").length}
          // Yalnızca bugün tarihli, tamamlanmamış görev ve randevular (BR-TSK-002).
          pendingTasks={todayItems.filter((item) => item.status === "open").length}
          locale={locale}
        />
        <GettingStarted steps={steps} />
      </div>
      <div className="tablet:col-span-2 laptop:col-span-7 laptop:col-start-1 laptop:row-start-2 laptop:self-start">
        <QuickActions />
      </div>
      <div className="tablet:col-span-2 laptop:col-span-7 laptop:col-start-1 laptop:row-start-3 laptop:self-start">
        <RecentTransactions transactions={allTransactions} locale={locale} />
      </div>
      <div className="laptop:col-span-7 laptop:col-start-1 laptop:row-span-2 laptop:row-start-4 laptop:self-start">
        <TodayAgenda today={today} items={todayItems} overdue={overdue} payments={dueToday} />
      </div>
      {/* Pages: mobilde Bugünün Akışı ile Yaklaşan Ödemeler arasında ayırıcı çizgi. */}
      <hr className="border-border-subtle tablet:hidden" />
      <div className="laptop:col-span-5 laptop:col-start-8 laptop:row-span-3 laptop:row-start-2 laptop:self-start">
        <UpcomingPayments today={today} />
      </div>
      {goal && (
        <div className="tablet:col-span-2 laptop:col-span-4 laptop:col-start-9 laptop:row-start-1">
          <SavingsGoalCard goal={goal} locale={locale} />
        </div>
      )}
    </div>
  );
}
