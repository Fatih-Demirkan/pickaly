import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import type { CalendarRepository } from "./data/repository";
import { mockCalendarRepository } from "./data/mock-repository";
import { supabaseCalendarRepository } from "./data/supabase-repository";

// Takvim verisine sunucu tarafı erişim. Supabase tanımlıysa veritabanı (kullanıcıya özel, RLS), değilse yerel depo.
export const calendarRepository: CalendarRepository = isSupabaseConfigured() ? supabaseCalendarRepository : mockCalendarRepository;
