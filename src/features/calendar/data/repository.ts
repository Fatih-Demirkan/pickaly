import type { DateKey } from "@/lib/dates";
import type { CalendarItem, CalendarItemInput } from "../domain/types";

/** Takvim kaydı veri erişimi sözleşmesi (TECH_STACK §2). */
export interface CalendarRepository {
  /** `from` ve `to` dahil günler arasındaki kayıtlar. */
  listBetween(from: DateKey, to: DateKey): Promise<CalendarItem[]>;
  /** Bu günden önce kalmış, tamamlanmamış kayıtlar (BR-TSK-002 "Gecikmiş"). */
  listOverdue(before: DateKey): Promise<CalendarItem[]>;
  get(id: string): Promise<CalendarItem | null>;
  create(input: CalendarItemInput): Promise<CalendarItem>;
  update(id: string, input: CalendarItemInput): Promise<CalendarItem | null>;
  setStatus(id: string, status: CalendarItem["status"], completedAt: string | null): Promise<CalendarItem | null>;
  remove(id: string): Promise<boolean>;
}
