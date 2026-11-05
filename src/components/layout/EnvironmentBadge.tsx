import { getTranslations } from "next-intl/server";
import { getAppEnvironment } from "@/lib/env";

/**
 * Production dışındaki ortamlarda sürekli görünen ortam etiketi (TECH_STACK §13.2 madde 6).
 * Test ortamının production ile karıştırılmasını önler. Production'da hiçbir şey göstermez.
 */
export async function EnvironmentBadge() {
  const environment = getAppEnvironment();
  if (environment === "production") return null;

  const t = await getTranslations("environment");

  return (
    <div
      role="status"
      className={[
        // Header aksiyonlarının ve sağ alttaki "Yeni işlem" FAB'ının üstüne binmemesi için sol altta;
        // mobilde alt nav'ın hemen üstünde.
        "pointer-events-none fixed start-8 bottom-[calc(var(--layout-bottom-nav-offset)+8px+env(safe-area-inset-bottom))] z-(--z-toast) rounded-full px-8 py-4 text-nav tablet:start-[calc(var(--layout-nav-width)+8px)]",
        environment === "staging" ? "bg-status-warning-subtle text-text-on-warning" : "bg-surface-muted text-text-secondary",
      ].join(" ")}
    >
      {t(environment)}
    </div>
  );
}
