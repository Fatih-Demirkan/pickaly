import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import { CategoryIcon, type Category } from "@/features/categories";
import { itemHref, type CalendarItem } from "@/features/calendar";
import { CompleteToggle } from "@/features/calendar/components/CompleteToggle";
import { SubtaskProgress } from "@/features/calendar/components/SubtaskProgress";
import { subtaskProgress } from "@/features/calendar/domain/types";
import { cn } from "@/lib/cn";

// Pages → Ana Sayfa "Bugünün Akışı" görev / randevu satırı (6:1082, 6:1126):
//   DESIGN_SYSTEM_PICKALY §5.3: beyaz, radius-md, padding 12, elev-1; 36 px ikon karosu + body-strong başlık + Görev çipi (mor), alt satır saat caption-strong • kategori caption text-secondary; sağda ✓.
// Tamamlanan kayıt akışta soluk ve üstü çizili kalır (PRD BR-TSK-001, Q-19). Kartın tamamı Kayıt Detayı'nı açar.
// Kategorisiz kayıtta ikon karosu Görev çipinin rengiyle (violet) gösterilir.

// [Karar ürün sahibi 2026-11-05] Görev / Randevu ayrımı arayüzde yok: her kayıt Görev çipi ve violet karo.
const fallbackCategory = { icon: null, color: "violet", type: "calendar" } as const;

export async function AgendaTaskCard({ item, category }: { item: CalendarItem; category: Category | undefined }) {
  const t = await getTranslations("calendar");
  const done = item.status === "done";
  const progress = subtaskProgress(item.subtasks);

  return (
    <li className={cn("relative flex items-center gap-12 rounded-md bg-surface-card p-12 shadow-elev-1 transition-colors hover:bg-action-tertiary-hover", done && "opacity-60")}>
      <CategoryIcon category={category ?? fallbackCategory} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="flex min-w-0 items-center gap-8">
          <Link
            href={itemHref(item.id, { day: item.date })}
            className={cn("truncate text-body-strong after:absolute after:inset-0 after:rounded-md", done ? "text-text-secondary line-through" : "text-text-primary")}
          >
            {item.title}
          </Link>
          <Chip variant="task">{t("kind.task")}</Chip>
        </span>
        <p className="flex min-w-0 items-center gap-8 text-caption">
          <span className="shrink-0 text-caption-strong text-text-primary">{item.time ?? t("card.allDay")}</span>
          {category && (
            <>
              <span aria-hidden className="text-text-secondary">
                •
              </span>
              <span className="truncate text-text-secondary">{category.name}</span>
            </>
          )}
        </p>
        {progress && <SubtaskProgress done={progress.done} total={progress.total} label={t("subtasks.progress")} size="sm" className="pt-4" />}
      </div>
      <CompleteToggle id={item.id} title={item.title} done={done} />
    </li>
  );
}
