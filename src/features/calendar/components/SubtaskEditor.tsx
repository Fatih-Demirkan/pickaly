"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { inputClass } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { SUBTASK_MAX_COUNT, SUBTASK_TITLE_MAX_LENGTH, type Subtask } from "../domain/types";
import { SubtaskProgress } from "./SubtaskProgress";

// Görev formu → "Çoklu seçim" açıkken alt görev listesi (ürün sahibi isteği 2026-11-05; alışveriş listesi gibi).
//   Düzenleme: her satırda işaret kutusu + metin alanı + sil (×); altında "Ekle" (yeni satır, odak ona geçer) ve
//   "Tamamla" (boş satırları atar, düzenlemeyi bitirir). Bitmiş listede satırlar metin olur, kutular işaretlenebilir;
//   "Listeyi düzenle" ile tekrar düzenlenir. Üstte ilerleme barı (işaretli / toplam).
// [Türetme] Görünüm DESIGN_SYSTEM_PICKALY §5.7 (checkbox 20 px, border-control, seçili blue.600) + §5.9 ilerleme çubuğu.

type SubtaskEditorProps = { value: Subtask[]; onChange: (next: Subtask[]) => void };

const newSubtask = (): Subtask => ({ id: crypto.randomUUID(), title: "", done: false });

function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="touch-target relative inline-flex size-20 shrink-0 cursor-pointer items-center justify-center">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} aria-label={label} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          "inline-flex size-20 items-center justify-center rounded-xs border-[1.5px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border-focus",
          checked ? "border-brand-primary bg-brand-primary text-text-inverse" : "border-border-control bg-surface-card",
        )}
      >
        {checked && <Icon icon="confirm" size="sm" />}
      </span>
    </label>
  );
}

export function SubtaskEditor({ value, onChange }: SubtaskEditorProps) {
  const t = useTranslations("calendar.subtasks");
  // Mevcut liste varsa bitmiş hâlde açılır; boşsa doğrudan düzenleme ve bir boş satırla.
  const [editing, setEditing] = useState(value.length === 0);
  // Boş listede gösterilen ilk satırın kimliği sabit kalır (her çizimde yeniden oluşup odağı kaybetmesin).
  const [draftRow] = useState(newSubtask);
  const rows = editing && value.length === 0 ? [draftRow] : value;
  const inputs = useRef(new Map<string, HTMLInputElement>());
  // Yeni eklenen satır: liste üst bileşende güncellendikten (commit) sonra odak ona geçer.
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!pendingFocus.current) return;
    const input = inputs.current.get(pendingFocus.current);
    if (input) {
      input.focus();
      pendingFocus.current = null;
    }
  });
  const done = rows.filter((row) => row.done && row.title.trim()).length;
  const total = rows.filter((row) => row.title.trim()).length;

  const update = (next: Subtask[]) => onChange(next);
  const patch = (id: string, change: Partial<Subtask>) => update(rows.map((row) => (row.id === id ? { ...row, ...change } : row)));

  const add = () => {
    if (rows.length >= SUBTASK_MAX_COUNT) return;
    const row = newSubtask();
    pendingFocus.current = row.id;
    update([...rows, row]);
  };

  const finish = () => {
    update(rows.map((row) => ({ ...row, title: row.title.trim() })).filter((row) => row.title));
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-12">
      {total > 0 && <SubtaskProgress done={done} total={total} label={t("progress")} />}

      {editing ? (
        <ul className="flex flex-col gap-8">
          {rows.map((row, index) => (
            <li key={row.id} className="flex items-center gap-12">
              <Checkbox checked={row.done} label={t("toggle", { title: row.title || t("item", { index: index + 1 }) })} onChange={(checked) => patch(row.id, { done: checked })} />
              <input
                ref={(element) => {
                  if (element) inputs.current.set(row.id, element);
                  else inputs.current.delete(row.id);
                }}
                value={row.title}
                maxLength={SUBTASK_TITLE_MAX_LENGTH}
                placeholder={t("placeholder")}
                aria-label={t("item", { index: index + 1 })}
                onChange={(event) => patch(row.id, { title: event.target.value })}
                onKeyDown={(event) => {
                  // Enter: yeni satır (form gönderilmez).
                  if (event.key === "Enter") {
                    event.preventDefault();
                    add();
                  }
                }}
                className={cn(inputClass, "h-44 min-w-0 flex-1", row.done && "text-text-secondary line-through")}
              />
              <button
                type="button"
                onClick={() => update(rows.filter((item) => item.id !== row.id))}
                aria-label={t("remove", { index: index + 1 })}
                className="touch-target inline-flex size-32 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary"
              >
                <Icon icon="close" size="sm" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {rows.map((row) => (
            <li key={row.id} className="flex min-h-44 items-center gap-12 py-8">
              <Checkbox checked={row.done} label={t("toggle", { title: row.title })} onChange={(checked) => patch(row.id, { done: checked })} />
              <span className={cn("min-w-0 flex-1 text-body", row.done ? "text-text-secondary line-through" : "text-text-primary")}>{row.title}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-8">
        {editing ? (
          <>
            <Button size="sm" variant="secondary" leadingIcon="add" onClick={add} disabled={rows.length >= SUBTASK_MAX_COUNT}>
              {t("add")}
            </Button>
            <Button size="sm" variant="contrast" leadingIcon="confirm" onClick={finish}>
              {t("finish")}
            </Button>
          </>
        ) : (
          <Button size="sm" variant="tertiary" leadingIcon="edit" onClick={() => setEditing(true)}>
            {t("edit")}
          </Button>
        )}
      </div>
    </div>
  );
}
