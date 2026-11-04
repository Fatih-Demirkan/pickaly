import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import { CategoryIcon, type Category } from "@/features/categories";
import { itemHref, type CalendarItem } from "@/features/calendar";
import { CompleteToggle } from "@/features/calendar/components/CompleteToggle";
import { cn } from "@/lib/cn";

// Pages → Ana Sayfa "Bugünün Akışı" görev / randevu satırı (6:1082, 6:1126):
//   DESIGN_SYSTEM_PICKALY §5.3: beyaz, radius-md, padding 12, elev-1; 36 px ikon karosu + body-strong başlık + tür çipi (Randevu yeşil /
//   Görev mor), alt satır saat caption-strong • kategori caption text-secondary; sağda ✓.
// Tamamlanan kayıt akışta soluk ve üstü çizili kalır (PRD BR-TSK-001, Q-19). Kartın tamamı Kayıt Detayı'nı açar.
// Kategorisiz kayıtta ikon karosu Görev / Randevu çipinin rengiyle (violet / green) gösterilir.

const fallbackCategory = {
  task: { icon: null, color: "violet", type: "calendar" },
  appointment: { icon: null, color: "green", type: "calendar" },
} as const;

export async function AgendaTaskCard({ item, category }: { item: CalendarItem; category: Category | undefined }) {
  const t = await getTranslations("calendar");
  const done = item.status === "done";

  return (
    <li className={cn("relative flex items-center gap-12 rounded-md bg-surface-card p-12 shadow-elev-1 transition-colors hover:bg-action-tertiary-hover", done && "opacity-60")}>
      <CategoryIcon category={category ?? fallbackCategory[item.kind]} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="flex min-w-0 items-center gap-8">
          <Link
            href={itemHref(item.id, { day: item.date })}
            className={cn("truncate text-body-strong after:absolute after:inset-0 after:rounded-md", done ? "text-text-secondary line-through" : "text-text-primary")}
          >
            {item.title}
          </Link>
          <Chip variant={item.kind === "appointment" ? "success" : "task"}>{t(`kind.${item.kind}`)}</Chip>
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
      </div>
      <CompleteToggle id={item.id} title={item.title} done={done} />
    </li>
  );
}
