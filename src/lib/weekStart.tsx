"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { WeekStart } from "./dates";

// Haftanın ilk günü tercihi istemci bileşenlerine (ör. DatePicker) context ile ulaşır. (app)/layout sunucudan doldurur.

const WeekStartContext = createContext<WeekStart>(1);

export function WeekStartProvider({ weekStart, children }: { weekStart: WeekStart; children: ReactNode }) {
  return <WeekStartContext.Provider value={weekStart}>{children}</WeekStartContext.Provider>;
}

export function useWeekStart(): WeekStart {
  return useContext(WeekStartContext);
}
