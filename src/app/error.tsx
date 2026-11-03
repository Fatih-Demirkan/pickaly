"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/layout/PageContainer";

// Rota düzeyi hata sınırı. Kullanıcıya teknik ayrıntı gösterilmez (PRD NFR-SEC-004).
// Hata izleme (Sentry, D-9) eklendiğinde burada raporlanacak; kişisel veri loglanmaz.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="min-h-dvh bg-surface-page">
      <PageContainer width="form" className="flex min-h-dvh flex-col justify-center gap-(--layout-stack-gap)">
        <h1 className="text-heading-h2 text-text-primary">{t("errors.genericTitle")}</h1>
        <p className="text-body-md text-text-secondary">{t("errors.genericBody")}</p>
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-48 w-fit items-center rounded-md bg-brand-primary px-16 text-button text-text-inverse hover:bg-brand-primary-hover"
        >
          {t("common.retry")}
        </button>
      </PageContainer>
    </main>
  );
}
