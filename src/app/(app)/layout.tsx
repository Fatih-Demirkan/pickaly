import { Suspense, type ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/layout/AppShell";
import { AppNavigation } from "@/components/layout/AppNavigation";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { BackgroundUrlTracker } from "@/components/layout/BackgroundUrlTracker";
import { FlashToast } from "@/components/ui/FlashToast";
import { ToastProvider } from "@/components/ui/Toast";
import { getSettings } from "@/features/settings/server";
import { WeekStartProvider } from "@/lib/weekStart";

// Oturum gerektiren uygulama alanı (TECH_STACK §2): ortak iskelet (navigasyon + üst bar), başarı bildirimleri (toast,
// yönlendirme sonrası flash dahil) ve istemcinin ihtiyaç duyduğu tercihler (haftanın ilk günü).
// sheet: bulunulan ekranın üstünde açılan bottom sheet slot'u (Yeni İşlem; config/navigation isSheetRoute).
export default async function AppLayout({ children, sheet }: { children: ReactNode; sheet: ReactNode }) {
  const [t, settings] = await Promise.all([getTranslations("common"), getSettings()]);
  return (
    <ToastProvider dismissLabel={t("dismissNotification")}>
      <WeekStartProvider weekStart={settings.weekStart}>
        <AppShell navigation={<AppNavigation />} topBar={<AppTopBar />}>
          {children}
        </AppShell>
        {sheet}
      </WeekStartProvider>
      {/* useSearchParams okuduğu için kendi Suspense sınırında (cacheComponents). */}
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <Suspense fallback={null}>
        <BackgroundUrlTracker />
      </Suspense>
    </ToastProvider>
  );
}
