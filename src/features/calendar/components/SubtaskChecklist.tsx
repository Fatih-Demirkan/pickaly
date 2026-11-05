"use client";

import { useOptimistic, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { setSubtaskDoneAction } from "../actions";
import type { Subtask } from "../domain/types";
import { SubtaskProgress } from "./SubtaskProgress";

// Kayıt Detayı → Alt Görevler: satıra dokununca işaretlenir / işareti kalkar; ilerleme barı anında güncellenir
// (iyimser güncelleme, hata olursa geri döner ve toast gösterilir). Liste kartı: beyaz, radius-md, elev-1, satırlar
// 48 px, border-subtle ayraç (DESIGN_SYSTEM_PICKALY §5.3, §5.7 checkbox).

export function SubtaskChecklist({ itemId, subtasks }: { itemId: string; subtasks: Subtask[] }) {
  const t = useTranslations("calendar.subtasks");
  const tCalendar = useTranslations("calendar");
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [items, setOptimistic] = useOptimistic(subtasks, (current: Subtask[], change: { id: string; done: boolean }) =>
    current.map((subtask) => (subtask.id === change.id ? { ...subtask, done: change.done } : subtask)),
  );
  const done = items.filter((subtask) => subtask.done).length;

  const toggle = (subtask: Subtask) =>
    startTransition(async () => {
      setOptimistic({ id: subtask.id, done: !subtask.done });
      const result = await setSubtaskDoneAction(itemId, subtask.id, !subtask.done);
      if (!result.ok) toast({ message: tCalendar("card.failed"), tone: "error" });
    });

  return (
    <div className="flex flex-col gap-12">
      <SubtaskProgress done={done} total={items.length} label={t("progress")} />
      <ul className="divide-y divide-border-subtle overflow-hidden rounded-md bg-surface-card shadow-elev-1">
        {items.map((subtask) => (
          <li key={subtask.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={subtask.done}
              onClick={() => toggle(subtask)}
              className="flex min-h-48 w-full items-center gap-12 px-16 py-12 text-start transition-colors hover:bg-surface-page"
            >
              <span
                aria-hidden
                className={cn(
                  "inline-flex size-20 shrink-0 items-center justify-center rounded-xs border-[1.5px] transition-colors",
                  subtask.done ? "border-brand-primary bg-brand-primary text-text-inverse" : "border-border-control bg-surface-card",
                )}
              >
                {subtask.done && <Icon icon="confirm" size="sm" />}
              </span>
              <span className={cn("min-w-0 flex-1 text-body", subtask.done ? "text-text-secondary line-through" : "text-text-primary")}>{subtask.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
