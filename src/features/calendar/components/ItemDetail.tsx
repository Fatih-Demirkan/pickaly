import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import { categoryChipClass, type Category } from "@/features/categories";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatDateLong, formatWeekday } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { deleteCalendarItemAction } from "../actions";
import { endTime } from "../domain/agenda";
import type { CalendarItem } from "../domain/types";
import { CompleteToggle } from "./CompleteToggle";
import { SubtaskChecklist } from "./SubtaskChecklist";

// Pages → Görev Detayı ve Durum Yönetimi / "Kayıt Detayı" (6:8233, PRD FR-CAL-007…010).
//   Durum kartı: radius-2xl, padding 16, aralık 12, gradyan beyaz → Neutral/100, border, shadow-elev-2;
//     "Yüksek Öncelik" (Category/Pink) + kategori çipi · başlık Heading/H2 · açıklama Body/Small text-secondary · ayırıcı
//     "Zaman & Hatırlatma" Label/Default text-secondary; satırlar: surface-card, border-default, radius-md, padding 4,
//     30 px Neutral/200 ikon kutusu, etiket Body/Small text-secondary + değer Button/Default
//   Konum & Notlar: liste kartı (radius-lg, padding 12, aralık 12), 40 px Category/Blue ikon kutusu; "Haritada aç" Brand/Primary
//   Planlanan Finansal Harcama: "İlişkili harcama tahmini" Label/Small + tutar Semantic/Gider - Hata (BR-TSK-003)
//   "Kaydı kalıcı olarak sil" tam genişlik Destructive LG · alt bar "Düzenle" (Tertiary) + "Görevi tamamla" (Primary)
// [Eksik] "Tekrarlama Döngüsü" satırı: tekrarlayan görevler (FR-CAL-012) sonraki dilimde; kayıt yoksa satır gösterilmez.
// [Varsayım] Pages'ta birden çok hatırlatıcı ("1 gün önce & 1 saat önce") görünüyor; kayıt başına tek hatırlatma tutulur.
// "Haritada aç" adresi yeni sekmede Google Haritalar aramasıyla açar (PRD FR-CAL-014 [Varsayım: dış harita bağlantısı]).
// Boş bölümler (konum, not, harcama) gösterilmez.

function TimeRow({ icon, label, children }: { icon: AppIconName; label: string; children: ReactNode }) {
  return (
    <div className="flex items-stretch gap-8 rounded-md bg-surface-page p-4">
      <span aria-hidden className="inline-flex w-30 shrink-0 items-center justify-center rounded-sm bg-surface-card text-text-primary">
        <Icon icon={icon} size="sm" />
      </span>
      <span className="flex min-w-0 flex-col py-2">
        <span className="text-caption text-text-secondary">{label}</span>
        <span className="text-button text-text-primary">{children}</span>
      </span>
    </div>
  );
}

function InfoCard({ icon, children }: { icon: AppIconName; children: ReactNode }) {
  return (
    <div className="flex gap-12 rounded-md bg-surface-card p-12 shadow-elev-1">
      <span aria-hidden className="inline-flex w-36 shrink-0 items-center justify-center self-stretch rounded-sm bg-category-blue text-category-fg-blue">
        <Icon icon={icon} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-4">{children}</div>
    </div>
  );
}

type ItemDetailProps = { item: CalendarItem; category: Category | undefined; locale: Locale; editHref: string };

export async function ItemDetail({ item, category, locale, editHref }: ItemDetailProps) {
  const [t, tRecurrence] = await Promise.all([getTranslations("calendar"), getTranslations("recurrence")]);
  const done = item.status === "done";

  const duration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) return t("detail.minutes", { count: rest });
    return rest === 0 ? t("detail.hours", { count: hours }) : t("detail.hoursMinutes", { hours, minutes: rest });
  };
  const place = [item.locationName, item.locationAddress].filter(Boolean).join(", ");

  return (
    <article className="flex flex-1 flex-col gap-(--layout-section-gap)">
      <section className="flex flex-col gap-12 rounded-lg bg-surface-card p-16 shadow-elev-1">
        <div className="flex flex-wrap items-center gap-4">
          {item.priority === "high" && <Chip variant="payment">{t("detail.highPriority")}</Chip>}
          {category && <span className={cn("inline-flex h-24 items-center rounded-full px-8 text-caption-strong", categoryChipClass(category.color))}>{category.name}</span>}
          {done && <Chip variant="success">{t("agenda.done")}</Chip>}
        </div>
        <div className="flex flex-col">
          <h2 className={cn("text-title-md", done ? "text-text-secondary line-through" : "text-text-primary")}>{item.title}</h2>
          {item.description && <p className="text-caption text-text-secondary">{item.description}</p>}
        </div>
        <hr className="border-border-subtle" />
        <section aria-labelledby={`time-${item.id}`} className="flex flex-col gap-8">
          <h3 id={`time-${item.id}`} className="text-body-strong text-text-secondary">
            {t("detail.timeAndReminder")}
          </h3>
          <TimeRow icon="calendar" label={t("detail.date")}>
            {formatDateLong(item.date, locale)}, {formatWeekday(item.date, locale)}
          </TimeRow>
          <TimeRow icon="time" label={t("detail.time")}>
            {item.time ? (
              <>
                {item.durationMinutes ? `${item.time} - ${endTime(item.time, item.durationMinutes)}` : item.time}
                {item.durationMinutes && <span className="text-text-secondary"> ({duration(item.durationMinutes)})</span>}
              </>
            ) : (
              t("detail.allDay")
            )}
          </TimeRow>
          <TimeRow icon="reminder" label={t("detail.reminders")}>
            {tRecurrence(`reminder.${item.reminder}`)}
          </TimeRow>
        </section>
      </section>

      {(place || item.note) && (
        <section aria-labelledby={`notes-${item.id}`} className="flex flex-col gap-12">
          <h3 id={`notes-${item.id}`} className="text-title-sm text-text-primary">
            {t("detail.locationNotes")}
          </h3>
          <div className="flex flex-col gap-8">
            {place && (
              <InfoCard icon="location">
                <span className="flex items-center justify-between gap-8">
                  <span className="text-caption-strong text-text-secondary">{t("detail.address")}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("detail.openMapLabel", { place })}
                    className="touch-target inline-flex items-center gap-4 text-caption-strong text-text-brand hover:underline"
                  >
                    {t("detail.openMap")}
                    <Icon icon="openExternal" size="sm" />
                  </a>
                </span>
                {item.locationName && <span className="text-body-strong text-text-primary">{item.locationName}</span>}
                {item.locationAddress && <span className="text-caption text-text-secondary">{item.locationAddress}</span>}
              </InfoCard>
            )}
            {item.note && (
              <InfoCard icon="notes">
                <span className="text-caption-strong text-text-secondary">{t("detail.notes")}</span>
                <p className="text-body text-text-primary">{item.note}</p>
              </InfoCard>
            )}
          </div>
        </section>
      )}

      {item.subtasks.length > 0 && (
        <section aria-labelledby={`subtasks-${item.id}`} className="flex flex-col gap-12">
          <h3 id={`subtasks-${item.id}`} className="text-title-sm text-text-primary">
            {t("subtasks.title")}
          </h3>
          <SubtaskChecklist itemId={item.id} subtasks={item.subtasks} />
        </section>
      )}

      {item.plannedExpenseMinor !== null && (
        <section aria-labelledby={`expense-${item.id}`} className="flex flex-col gap-12">
          <h3 id={`expense-${item.id}`} className="text-title-sm text-text-primary">
            {t("detail.plannedExpense")}
          </h3>
          <p className="flex items-center justify-between gap-12 rounded-md bg-surface-card p-12 shadow-elev-1">
            <span className="text-caption-strong text-text-secondary">{t("detail.plannedExpenseLabel")}</span>
            <span className="text-body-strong text-text-danger">{formatMoney(-item.plannedExpenseMinor, locale, "always")}</span>
          </p>
        </section>
      )}

      <ConfirmDialog
        trigger={{ label: t("detail.delete"), icon: "delete", variant: "destructive", className: "w-full" }}
        title={t("deleteDialog.title")}
        body={t("deleteDialog.body", { title: item.title })}
        cancelLabel={t("deleteDialog.cancel")}
        confirmLabel={t("deleteDialog.confirm")}
        action={deleteCalendarItemAction.bind(null, item.id)}
      />

      <ActionFooter>
        <ButtonLink href={editHref} scroll={false} variant="tertiary" leadingIcon="edit">
          {t("detail.edit")}
        </ButtonLink>
        <CompleteToggle id={item.id} title={item.title} done={done} variant="footer" />
      </ActionFooter>
    </article>
  );
}
