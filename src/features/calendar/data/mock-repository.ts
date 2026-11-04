import "server-only";
import { isDemoDataEnabled } from "@/lib/env";
import { addDays, localDateTimeToIso, toDateKey } from "@/lib/dates";
import { majorToMinor } from "@/lib/money";
import type { CalendarItem } from "../domain/types";
import type { CalendarRepository } from "./repository";

// GEÇİCİ YEREL ÖRNEK VERİ DEPOSU — gerçek kullanıcı verisi değildir.
// Veriler sunucu belleğinde tutulur: sunucu yeniden başlayınca örnek verilere döner.
// Bugünkü kayıtlar Pages → Takvim ve Kayıt Detayı örneklerinden alınmıştır (Diş Hekimi Kontrolü, Tedarikçi
// Sözleşmesi İnceleme, Haftalık Market Alışverişi). Diğer günlerdeki kayıtlar takvimin boş görünmemesi için
// eklenmiş örneklerdir; tarihler bugüne göre üretilir.

type Seed = Omit<CalendarItem, "id" | "date" | "completedAt"> & { id: string; daysFromToday: number };

const base = { description: null, categoryId: null, durationMinutes: 60, reminder: "1h", locationName: null, locationAddress: null, note: null, plannedExpenseMinor: null, priority: "normal", status: "open" } as const;

const seeds: Seed[] = [
  {
    ...base,
    id: "cal-dentist",
    kind: "appointment",
    title: "Diş Hekimi Kontrolü",
    description: "Yıllık periyodik ağız ve diş sağlığı muayenesi",
    priority: "high",
    categoryId: "cat-cal-health",
    daysFromToday: 0,
    time: "09:30",
    reminder: "1d",
    locationName: "Dt. Selin Yıldız Kliniği",
    locationAddress: "Valikonağı Cad. No:42/B, Nişantaşı, Şişli",
    note: "Randevu öncesi son tahlil sonuçlarını ve reçeteyi yanına almayı unutma. Girişte onay kodunu ilet.",
    plannedExpenseMinor: majorToMinor(1550),
  },
  {
    ...base,
    id: "cal-contract",
    kind: "task",
    title: "Tedarikçi Sözleşmesi İnceleme",
    description: "Hukuk ekibiyle son taslak üzerinden geçilecek",
    priority: "high",
    categoryId: "cat-cal-work",
    daysFromToday: 0,
    time: "11:30",
  },
  {
    ...base,
    id: "cal-groceries",
    kind: "task",
    title: "Haftalık Market Alışverişi",
    description: "Organik reyon ve mutfak temel ihtiyaçları tamamlandı",
    categoryId: "cat-cal-home",
    daysFromToday: 0,
    time: "09:00",
    durationMinutes: 45,
    status: "done",
  },
  // Gecikmiş örneği (BR-TSK-002).
  { ...base, id: "cal-documents", kind: "task", title: "Fatura belgelerini düzenle", categoryId: "cat-cal-home", daysFromToday: -2, time: "18:00", durationMinutes: 30 },
  { ...base, id: "cal-meeting", kind: "appointment", title: "Proje Sunumu", categoryId: "cat-cal-work", daysFromToday: 1, time: "14:00", locationName: "Ofis • Toplantı Odası 2" },
  { ...base, id: "cal-car", kind: "task", title: "Araç bakım randevusu al", daysFromToday: 3, time: null, durationMinutes: null },
  { ...base, id: "cal-gym", kind: "appointment", title: "Spor Salonu", categoryId: "cat-cal-health", daysFromToday: 6, time: "19:00", durationMinutes: 90 },
];

// Örnek içerik yalnızca PICKALY_DEMO_DATA=true iken yüklenir; varsayılan olarak depo boş başlar (lib/env.ts).
function buildSeed(): CalendarItem[] {
  const today = toDateKey(new Date());
  return seeds.map(({ daysFromToday, ...seed }) => {
    const date = addDays(today, daysFromToday);
    return { ...seed, date, completedAt: seed.status === "done" ? localDateTimeToIso(date, seed.time ?? "09:00") : null };
  });
}

const store = globalThis as typeof globalThis & { __pickalyMockCalendar?: CalendarItem[] };

function rows(): CalendarItem[] {
  store.__pickalyMockCalendar ??= isDemoDataEnabled() ? buildSeed() : [];
  return store.__pickalyMockCalendar;
}

export const mockCalendarRepository: CalendarRepository = {
  async listBetween(from, to) {
    return rows().filter((item) => item.date >= from && item.date <= to);
  },
  async listOverdue(before) {
    return rows().filter((item) => item.date < before && item.status === "open");
  },
  async get(id) {
    return rows().find((item) => item.id === id) ?? null;
  },
  async create(input) {
    const item: CalendarItem = { ...input, id: crypto.randomUUID(), status: "open", completedAt: null };
    rows().push(item);
    return item;
  },
  async update(id, input) {
    const item = rows().find((row) => row.id === id);
    if (!item) return null;
    Object.assign(item, input);
    return item;
  },
  async setStatus(id, status, completedAt) {
    const item = rows().find((row) => row.id === id);
    if (!item) return null;
    Object.assign(item, { status, completedAt });
    return item;
  },
  async remove(id) {
    const list = rows();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    return true;
  },
};
