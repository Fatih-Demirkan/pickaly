import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Icon } from "@/components/ui/Icon";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

// GEÇİCİ başlangıç ekranı (Phase 1). Nihai Ana Sayfa / Dashboard DEĞİLDİR;
// Dashboard modülü geliştirilince (app)/page.tsx ile değiştirilecek.
// Görsel dil: marka bloğu Pages'taki Header'dan (H1 "Pickaly" + "Life & Money Planner"),
// kart Pages'taki liste kartı kalıbından (surface-card, border-default, radius-lg) alınmıştır.

const foundationItems = ["tokens", "i18n", "icons", "responsive"] as const;

export default async function StartPage() {
  const t = await getTranslations();

  return (
    <AppShell>
      <PageContainer className="flex min-h-dvh flex-col justify-center">
        <div className="grid gap-(--layout-section-gap) laptop:grid-cols-2 laptop:items-center">
          <header className="flex flex-col gap-4">
            <h1 className="text-heading-h1 text-text-primary">{t("app.name")}</h1>
            <p className="text-body-sm text-text-secondary">{t("app.tagline")}</p>
          </header>

          <section
            aria-labelledby="start-title"
            className="flex flex-col gap-(--layout-stack-gap) rounded-lg border border-border-default bg-surface-card p-(--layout-card-padding)"
          >
            <div className="flex flex-col gap-8">
              <h2 id="start-title" className="text-heading-h4 text-text-primary">
                {t("start.title")}
              </h2>
              <p className="text-body-md text-text-secondary">{t("start.body")}</p>
            </div>

            <div className="flex flex-col gap-8">
              <h3 className="text-label-sm text-text-secondary">{t("start.foundationTitle")}</h3>
              <ul className="flex flex-col gap-8">
                {foundationItems.map((item) => (
                  <li key={item} className="flex items-center gap-8 text-body-md text-text-primary">
                    <span className="text-status-success">
                      <Icon icon="confirm" size="sm" />
                    </span>
                    {t(`start.items.${item}`)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border-subtle pt-(--layout-stack-gap)">
              <LanguageSwitcher />
            </div>
          </section>
        </div>
      </PageContainer>
    </AppShell>
  );
}
