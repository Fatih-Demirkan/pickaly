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
        "fixed end-8 top-8 z-(--z-toast) rounded-full px-8 py-4 text-label-xs",
        environment === "staging" ? "bg-status-warning-subtle text-text-on-warning" : "bg-surface-muted text-text-secondary",
      ].join(" ")}
    >
      {t(environment)}
    </div>
  );
}
