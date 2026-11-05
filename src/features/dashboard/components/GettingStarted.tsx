import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";

// "Başlarken" yönlendirme kartı (ürün sahibi isteği 2026-11-05: "ilk açılan ekranda boş veriler geldiğinde yönlendirme
// yetersiz"). [Türetme] DESIGN_SYSTEM_PICKALY §5.2 standart kart + §5.3 liste satırı + §5.9 boş durum dili:
//   başlık title-sm + caption açıklama + sağda "n/4" ilerleme · 4 adım satırı: 36 px durum dairesi (tamamlanan: yeşil
//   check, bekleyen: border-control + sıra numarası) + body-strong başlık + caption ipucu + chevron. Satır ilgili formu açar.
// Adımların hepsi tamamlanınca kart gösterilmez.

export type GettingStartedSteps = { account: boolean; transaction: boolean; task: boolean; savings: boolean };

type Step = { key: keyof GettingStartedSteps; icon: AppIconName; href: string };

const STEPS: Step[] = [
  { key: "account", icon: "paymentMethod", href: "/profil/hesaplar/yeni" },
  { key: "transaction", icon: "add", href: "/islemler/yeni?tur=gelir" },
  { key: "task", icon: "task", href: "/takvim/yeni?tur=gorev" },
  { key: "savings", icon: "savings", href: "/birikimler/yeni" },
];

export async function GettingStarted({ steps }: { steps: GettingStartedSteps }) {
  const t = await getTranslations("dashboard.gettingStarted");
  const done = STEPS.filter((step) => steps[step.key]).length;
  if (done === STEPS.length) return null;

  return (
    <section aria-labelledby="getting-started-title" className="flex flex-col gap-12 rounded-lg bg-surface-card p-16 shadow-elev-1">
      <div className="flex items-start justify-between gap-12">
        <div className="flex min-w-0 flex-col gap-2">
          <h2 id="getting-started-title" className="text-title-sm text-text-primary">
            {t("title")}
          </h2>
          <p className="text-caption text-text-secondary">{t("subtitle")}</p>
        </div>
        <span className="shrink-0 rounded-full bg-brand-primary-subtle px-8 py-2 text-caption-strong text-text-brand">{t("progress", { done, total: STEPS.length })}</span>
      </div>
      <ol className="flex flex-col divide-y divide-border-subtle">
        {STEPS.map((step, index) => {
          const complete = steps[step.key];
          return (
            <li key={step.key}>
              <Link href={step.href} scroll={false} className="flex min-h-64 items-center gap-12 py-12 transition-colors hover:bg-surface-page">
                <span
                  aria-hidden
                  className={cn(
                    "inline-flex size-36 shrink-0 items-center justify-center rounded-full border text-caption-strong",
                    complete ? "border-transparent bg-category-green text-category-fg-green" : "border-border-control text-text-primary",
                  )}
                >
                  {complete ? <Icon icon="confirm" size="sm" /> : index + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className={cn("text-body-strong", complete ? "text-text-secondary" : "text-text-primary")}>
                    {t(`${step.key}.title`)}
                    <span className="sr-only">, {complete ? t("done") : t("todo")}</span>
                  </span>
                  <span className="text-caption text-text-secondary">{t(`${step.key}.hint`)}</span>
                </span>
                <span aria-hidden className="shrink-0 text-text-secondary">
                  <Icon icon={complete ? "next" : step.icon} size="sm" />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
