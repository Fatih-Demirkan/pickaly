import { getLocale, getTranslations } from "next-intl/server";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { getCategoryMap } from "@/features/categories/server";
import { isLocale } from "@/i18n/config";
import { formatMonthLabel, type MonthKey } from "@/lib/dates";
import { reportHref } from "../routes";
import { getMonthlyReport } from "../server";
import { SHARE_CARD_ID, ShareCard, shareRateText } from "./ShareCard";
import { ShareImageButton } from "./ShareImageButton";

// Pages → Paylaşılabilir Rapor Görünümü (136:8416), RESPONSIVE §3.5.2: mobil tam sayfa · tablet+ modal (max 520 px).
//   Başlık "× Rapor Önizleme & Paylaş" · ortada paylaşım kartı + açıklama Body/Small · alt bar (alt alta):
//   "Görsel Olarak Paylaş (Sosyal / Mesaj)" Primary + share-2, "PDF / Rapor Özeti İndir" Secondary + save.
// [Ertelendi] PDF / Rapor Özeti İndir V1.1'de (PRD FR-REP-008, D-11): buton devre dışı.
// Seçili ayda işlem yoksa paylaşım devre dışı (PRD §8 boş durum [Öneri]).

export async function ShareReportDialog({ month }: { month: MonthKey }) {
  const [t, tHeader, rawLocale, report, categories] = await Promise.all([
    getTranslations("reports.shareView"),
    getTranslations("header"),
    getLocale(),
    getMonthlyReport(month),
    getCategoryMap(),
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const closeHref = reportHref(month);
  const titleId = "share-report-title";
  const monthLabel = formatMonthLabel(month, locale);
  const expense = shareRateText(report.expenseRate, locale);
  const kept = shareRateText(report.savingsRate, locale);
  const empty = report.incomeMinor === BigInt(0) && report.expenseMinor === BigInt(0);

  return (
    <Drawer closeHref={closeHref} closeLabel={t("close")} labelledBy={titleId} size="modal">
      <FocusHeader title={t("title")} titleId={titleId} back={{ href: closeHref, label: t("close") }} backIcon="close" />
      <DrawerBody>
        <span id="share-unavailable" className="sr-only">
          {tHeader("unavailable")}
        </span>
        <div className="flex flex-col items-center gap-16">
          <ShareCard
            report={report}
            categories={categories}
            locale={locale}
            labels={{
              subtitle: t("subtitle", { month: monthLabel }),
              net: t("net"),
              savingsRate: t("savingsRate", { rate: kept }),
              income: t("income"),
              expense: t("expense"),
              balance: t("balance"),
              balanceValue: t("balanceValue", { spent: expense, kept }),
              spent: t("spent", { rate: expense }),
              kept: t("kept", { rate: kept }),
              top: t("top"),
              topHint: t("topHint"),
              empty: t("empty"),
              footer: t("footer"),
            }}
          />
          <p className="text-center text-caption text-text-secondary">{t("hint")}</p>
          {empty && (
            <p id="share-empty" className="text-center text-caption text-text-secondary">
              {t("emptyMonth")}
            </p>
          )}
        </div>
        <ActionFooter stacked>
          <ShareImageButton
            targetId={SHARE_CARD_ID}
            fileName={`pickaly-rapor-${month}.png`}
            title={t("subtitle", { month: monthLabel })}
            disabled={empty}
            describedBy={empty ? "share-empty" : undefined}
            labels={{ share: t("shareImage"), downloaded: t("downloaded"), failed: t("failed") }}
          />
          <Button variant="secondary" leadingIcon="save" disabled aria-describedby="share-unavailable">
            {t("pdf")}
          </Button>
        </ActionFooter>
      </DrawerBody>
    </Drawer>
  );
}
