import "server-only";
import type { CalendarRepository } from "./data/repository";
import { mockCalendarRepository } from "./data/mock-repository";

// Takvim verisine sunucu tarafı erişim. Supabase repository'si geldiğinde yalnızca burada değiştirilir.
export const calendarRepository: CalendarRepository = mockCalendarRepository;
