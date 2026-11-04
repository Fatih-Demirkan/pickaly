import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/layout/AppShell";
import { AppNavigation } from "@/components/layout/AppNavigation";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { ToastProvider } from "@/components/ui/Toast";
import { getSettings } from "@/features/settings/server";
import { WeekStartProvider } from "@/lib/weekStart";

// Oturum gerektiren uygulama alanı (TECH_STACK §2). Auth aşamasında burada oturum kontrolü yapılacak;
// şimdilik yalnızca ortak iskeleti (navigasyon + üst bar), başarı bildirimlerini (toast) ve istemcinin ihtiyaç duyduğu
// tercihleri (haftanın ilk günü) sağlar.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const [t, settings] = await Promise.all([getTranslations("common"), getSettings()]);
  return (
    <ToastProvider dismissLabel={t("dismissNotification")}>
      <WeekStartProvider weekStart={settings.weekStart}>
        <AppShell navigation={<AppNavigation />} topBar={<AppTopBar />}>
          {children}
        </AppShell>
      </WeekStartProvider>
    </ToastProvider>
  );
}
