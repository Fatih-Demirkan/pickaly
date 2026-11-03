import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <main id="main-content" className="min-h-dvh bg-surface-page">
      <PageContainer width="form" className="flex min-h-dvh flex-col justify-center gap-(--layout-stack-gap)">
        <h1 className="text-heading-h2 text-text-primary">{t("errors.notFoundTitle")}</h1>
        <p className="text-body-md text-text-secondary">{t("errors.notFoundBody")}</p>
        <Link
          href="/"
          className="inline-flex min-h-48 w-fit items-center rounded-md bg-brand-primary px-16 text-button text-text-inverse hover:bg-brand-primary-hover"
        >
          {t("common.backHome")}
        </Link>
      </PageContainer>
    </main>
  );
}
