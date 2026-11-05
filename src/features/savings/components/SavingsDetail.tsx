import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { listAccounts } from "@/features/accounts/server";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { daysBetween, formatDateLong, toDateKey } from "@/lib/dates";
import { closeSavingsAccountAction } from "../actions";
import { progressPercent, signedMovement, type SavingsMovement } from "../domain/types";
import { formatSavingsAmount } from "../format";
import { movementHref } from "../routes";
import { getSavingsDetail } from "../server";
import { CloseAccountDialog } from "./CloseAccountDialog";
import { kindChip, ProgressBar } from "./savingsStyle";

// Pages → Birikim Hesabı Detayı (129:6652, PRD FR-SAV-004/008/009/011), RESPONSIVE §3.4.3.
//   Durum kartı: tür çipi • "Aktif Birikim" (Yeşil); ad Label/Small + bakiye Data/Large; ayırıcı;
//     "Hedef: …" Label/Small + "(Kalan: …)"; ilerleme çubuğu; "Tamamlanma Oranı" + "%75 Tamamlandı" Brand/Primary
//   Bilgi notu: inline alert (DESIGN_SYSTEM_PICKALY §5.9) — blue.100 zemin, radius-lg, padding 16, blue.600 info ikonu, body
//   Hesap Parametreleri: liste kartı (satır padding 16, çizgi); Saklama Kurumu · Açılış Tarihi ("(4 ay önce)") ·
//     Son İşlem Tarihi (+ tutar) · Aylık Hedef Katkı ("5.000,00 ₺ / Ay") · Kullanıcı Notu (Neutral/50 kutu)
//   Geçmiş Hareketler: liste kartı; 32 px Category/Green kutuda arrow-down, başlık + tarih, sağda "+5.000,00 ₺"
//   "Birikim hesabını kapat / Sil" Destructive LG · alt bar "Para ekle / Çek" (Tertiary) + "Hesabı düzenle" (Primary)
// Mobil: tam sayfa odak ekranı. Laptop+: sol [8/12] durum kartı + Geçmiş Hareketler, sağ [4/12] Hesap Parametreleri +
//   bilgi notu + tehlike bölgesi; aksiyonlar üst barda (Para ekle / Çek Primary, Hesabı düzenle Secondary).
// [Varsayım] Çekme satırı Category/Red + arrow-up, eksi işaretli. Hareket başlıkları kaynağa göre üretilir.
// [Eksik] "Geçmiş Hareketler → Tümü" ekranı tasarlanmadı; son 5 hareket listelenir, bağlantı gösterilmez.

const HISTORY_LIMIT = 5;

function ParamRow({ label, children, stacked }: { label: string; children: ReactNode; stacked?: boolean }) {
  return (
    <div className={cn("flex gap-16 border-b border-border-subtle p-16 last:border-b-0", stacked ? "flex-col gap-6" : "items-center justify-between")}>
      <dt className="text-body text-text-secondary">{label}</dt>
      <dd className={cn("min-w-0", !stacked && "text-end")}>{children}</dd>
    </div>
  );
}

export async function SavingsDetail({ id }: { id: string }) {
  const detail = await getSavingsDetail(id);
  if (!detail) notFound();
  const [t, tRecurrence, rawLocale, bankAccounts] = await Promise.all([getTranslations("savings"), getTranslations("recurrence"), getLocale(), listAccounts()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const { account, movements } = detail;
  const linkedAccount = account.accountId ? bankAccounts.find((bank) => bank.id === account.accountId) : undefined;
  const percent = progressPercent(account);
  const completed = percent !== null && percent >= 100;
  const today = toDateKey(new Date());
  const amount = (value: bigint, sign?: "always") => formatSavingsAmount(value, account.unit, locale, sign);

  const openedDays = daysBetween(account.openedAt, today);
  const openedAgo =
    openedDays <= 0 ? t("detail.today") : openedDays < 30 ? t("detail.daysAgo", { count: openedDays }) : t("detail.monthsAgo", { count: Math.floor(openedDays / 30) });
  const movementTitle = (movement: SavingsMovement) =>
    movement.source === "manual" ? t(movement.direction === "in" ? "detail.movement.manualIn" : "detail.movement.manualOut") : t(`detail.movement.${movement.source}`);
  const closeTransfer = account.unit === "TRY" && account.balance > BigInt(0);

  const hero = (
    <section className="order-1 flex flex-col gap-12 rounded-lg bg-surface-card p-16 shadow-elev-1 laptop:order-none">
      <div className="flex flex-wrap items-center gap-4">
        <Chip variant={kindChip[account.kind]}>{t(`kindShort.${account.kind}`)}</Chip>
        <span aria-hidden className="w-8 text-center text-caption text-text-secondary">
          •
        </span>
        <Chip variant="success">{completed ? t("detail.completed") : t("detail.active")}</Chip>
      </div>
      <div className="flex flex-col">
        <h2 className="text-caption-strong text-text-secondary">{account.name}</h2>
        <p className="text-display-balance text-text-primary">{amount(account.balance)}</p>
      </div>
      {account.target !== null && percent !== null && (
        <>
          <hr className="border-border-subtle" />
          <div className="flex flex-col gap-8">
            <p className="flex items-center justify-between gap-8 text-caption-strong">
              <span className="text-text-primary">{t("detail.target", { amount: amount(account.target) })}</span>
              {!completed && <span className="text-text-secondary">{t("detail.remaining", { amount: amount(account.target - account.balance) })}</span>}
            </p>
            <ProgressBar percent={percent} label={t("detail.progressLabel")} />
            <p className="flex items-center justify-between gap-8 text-caption-strong">
              <span className="text-text-secondary">{t("detail.progress")}</span>
              <span className="text-text-brand">{t("detail.progressValue", { percent })}</span>
            </p>
          </div>
        </>
      )}
    </section>
  );

  const info = (
    <p className="order-2 flex gap-8 rounded-lg bg-status-info-subtle p-16 text-body text-text-primary laptop:order-none">
      <span className="mt-2 shrink-0 text-text-info">
        <Icon icon="info" />
      </span>
      {t("detail.info")}
    </p>
  );

  const parameters = (
    <section aria-labelledby="savings-parameters" className="order-3 flex flex-col gap-12 laptop:order-none">
      <h3 id="savings-parameters" className="text-title-sm text-text-primary">
        {t("detail.parameters")}
      </h3>
      <dl className="overflow-hidden rounded-md bg-surface-card shadow-elev-1">
        {linkedAccount && (
          <ParamRow label={t("detail.account")}>
            <p className="text-body-strong text-text-primary">{linkedAccount.name}</p>
            {linkedAccount.detail && <p className="text-caption text-text-secondary">{linkedAccount.detail}</p>}
          </ParamRow>
        )}
        <ParamRow label={t("detail.openedAt")}>
          <p className="text-body-strong text-text-primary">{formatDateLong(account.openedAt, locale)}</p>
          <p className="text-caption text-text-secondary">{openedAgo}</p>
        </ParamRow>
        {account.lastMovement && (
          <ParamRow label={t("detail.lastMovement")}>
            <p className="text-body-strong text-text-primary">{formatDateLong(toDateKey(new Date(account.lastMovement.occurredAt)), locale)}</p>
            <p className="text-caption text-text-secondary">{amount(signedMovement(account.lastMovement), "always")}</p>
          </ParamRow>
        )}
        {account.contribution && (
          <ParamRow label={t("detail.contribution")}>
            <p className="text-body-strong text-text-primary">
              {t("detail.contributionValue", { amount: amount(account.contribution.amount), frequency: t(`frequencyUnit.${account.contribution.frequency}`) })}
            </p>
            <p className="text-caption text-text-secondary">{tRecurrence(`frequency.${account.contribution.frequency}`)}</p>
          </ParamRow>
        )}
        {account.note && (
          <ParamRow label={t("detail.note")} stacked>
            <p className="rounded-sm bg-surface-page p-12 text-body text-text-primary">{account.note}</p>
          </ParamRow>
        )}
      </dl>
    </section>
  );

  const history = (
    <section aria-labelledby="savings-history" className="order-4 flex flex-col gap-12 laptop:order-none">
      <h3 id="savings-history" className="text-title-sm text-text-primary">
        {t("detail.history")}
      </h3>
      {movements.length === 0 ? (
        <p className="text-body text-text-secondary">{t("detail.historyEmpty")}</p>
      ) : (
        <ul className="overflow-hidden rounded-md bg-surface-card shadow-elev-1">
          {movements.slice(0, HISTORY_LIMIT).map((movement) => (
            <li key={movement.id} className="flex min-h-64 items-center justify-between gap-12 border-b border-border-subtle px-16 py-12 last:border-b-0">
              <span className="flex min-w-0 items-center gap-12">
                <span
                  aria-hidden
                  className={cn(
                    "inline-flex size-36 shrink-0 items-center justify-center rounded-sm",
                    movement.direction === "in" ? "bg-category-green text-category-fg-green" : "bg-category-red text-category-fg-red",
                  )}
                >
                  <Icon icon={movement.direction === "in" ? "trendDown" : "trendUp"} size="sm" />
                </span>
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="truncate text-body-strong text-text-primary">{movementTitle(movement)}</span>
                  <span className="text-caption text-text-secondary">{formatDateLong(toDateKey(new Date(movement.occurredAt)), locale)}</span>
                </span>
              </span>
              <span className="shrink-0 text-body-strong text-text-primary">{amount(signedMovement(movement), "always")}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  const danger = (
    <div className="order-5 laptop:order-none">
      <CloseAccountDialog
        labels={{
          trigger: t("detail.close"),
          title: t("closeDialog.title"),
          body: t("closeDialog.body", { name: account.name }),
          transferBody: closeTransfer ? t("closeDialog.transferBody", { amount: amount(account.balance) }) : undefined,
          noTransfer: t("closeDialog.noTransfer"),
          cancel: t("closeDialog.cancel"),
          confirm: t("closeDialog.confirm"),
        }}
        accounts={bankAccounts.map((bank) => ({ id: bank.id, name: bank.name }))}
        action={closeSavingsAccountAction.bind(null, account.id)}
      />
    </div>
  );

  const editHref = `/birikimler/${encodeURIComponent(account.id)}/duzenle`;

  return (
    <>
      <div className="tablet:hidden">
        <FocusHeader title={t("detail.title")} titleId="savings-detail-title" back={{ href: "/birikimler", label: t("detail.back") }} />
      </div>
      <PageContainer className="flex flex-col gap-(--layout-section-gap)">
        <div className="hidden items-center justify-between gap-12 tablet:flex">
          <div className="flex min-w-0 items-center gap-8">
            <Link
              href="/birikimler"
              aria-label={t("detail.back")}
              className="touch-target inline-flex size-36 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-primary transition-colors hover:border-border-strong hover:bg-action-tertiary-hover"
            >
              <Icon icon="back" />
            </Link>
            <h1 className="truncate text-title-md text-text-primary">{t("detail.title")}</h1>
          </div>
          <div className="hidden gap-8 laptop:flex">
            <ButtonLink href={editHref} scroll={false} variant="secondary" leadingIcon="edit">
              {t("detail.edit")}
            </ButtonLink>
            <ButtonLink href={movementHref(account.id)} scroll={false} leadingIcon="transfer">
              {t("detail.move")}
            </ButtonLink>
          </div>
        </div>

        {/* Mobil sıra Pages'taki gibidir; laptop+ iki sütuna ayrılır (display: contents ile aynı öğeler). */}
        <div className="flex flex-col gap-(--layout-section-gap) laptop:grid laptop:grid-cols-12 laptop:items-start laptop:gap-24">
          <div className="contents laptop:col-span-8 laptop:flex laptop:flex-col laptop:gap-(--layout-section-gap)">
            {hero}
            {history}
          </div>
          <div className="contents laptop:col-span-4 laptop:flex laptop:flex-col laptop:gap-(--layout-section-gap)">
            {parameters}
            {info}
            {danger}
          </div>
        </div>

        <div className="laptop:hidden">
          <ActionFooter>
            <ButtonLink href={movementHref(account.id)} scroll={false} variant="tertiary" leadingIcon="transfer">
              {t("detail.move")}
            </ButtonLink>
            <ButtonLink href={editHref} scroll={false} leadingIcon="edit">
              {t("detail.edit")}
            </ButtonLink>
          </ActionFooter>
        </div>
      </PageContainer>
    </>
  );
}
