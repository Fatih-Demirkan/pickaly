import { DEFAULT_TIME, toDateKey, type DateKey } from "@/lib/dates";
import { DEFAULT_REMINDER } from "@/lib/recurrence";
import type { ItemFormValues } from "./ItemForm";

/** Yeni görev / randevu formunun başlangıç değerleri (Takvim "Görev Ekle" ve Yeni İşlem sheet'i → Görev). */
export function newItemFormValues({ date }: { date?: DateKey } = {}): ItemFormValues {
  return {
    // Görev / Randevu ayrımı yok (ürün sahibi kararı 2026-11-05): her yeni kayıt Görev, Normal öncelik.
    kind: "task",
    title: "",
    description: "",
    priority: "normal",
    categoryId: "",
    date: date ?? toDateKey(new Date()),
    allDay: false,
    time: DEFAULT_TIME, // Yeni kayıt: 09:00 (ürün sahibi kararı 2026-11-05); süre varsayılan 60 dk
    duration: "60",
    reminder: DEFAULT_REMINDER,
    locationName: "",
    locationAddress: "",
    multi: false,
    subtasks: [],
    note: "",
    plannedExpense: "",
  };
}
