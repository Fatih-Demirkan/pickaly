import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SegmentedLinks } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/cn";
import { FINANCE_TYPES, type Category } from "../domain/types";
import { categoriesHref, editCategoryHref, newCategoryHref, type CategoryTab } from "../routes";
import { getCategoryUsage, listCategories, type CategoryUsage } from "../server";
import { CategoryIcon } from "./CategoryIcon";
import { categoryChipClass } from "./categoryStyle";
import { CategoryRemoveButton } from "./CategoryRemoveButton";
import { RestoreCategoryButton } from "./RestoreCategoryButton";

// Pages → Kategori Yönetimi (152:770, PRD FR-SET-008), RESPONSIVE §3.6.2.
//   Odak başlığı "← Kategori Yönetimi" · segmented "Harcama / Gelir" | "Görev / Takvim"
//   "Finansal Kategoriler" Heading/H4 + "Toplam n Kategori" Label/Small · satır kartı: radius-lg, padding 12; 40 px
//     kategori ikon kutusu + ad Label/Default + renk çipi; altında "n işlem" Body/Small; sağda pencil + trash (20 px, aralık 16)
//   alt bar "Yeni Kategori Oluştur" (Primary, tam genişlik)
// Tablet+: 2 sütunlu grid · desktop: 3 sütun [Varsayım: laptop genişliğinde 3 sütunda adlar sığmıyor]; segmented ve "Yeni" butonu üst barda. Tam sayfa (rail / sidebar görünür).
// Arşivlenenler (BR-CAT-005, RESPONSIVE §8.2.11 [Varsayım]): listenin altında kapalı, genişletilebilir grup; satırlar
//   text-secondary, sağda "Geri al".
// [Varsayım] Pages'ta çip renk adını gösteriyor ("Teal", "Green"); TR'de Türkçe renk adı kullanılır.
// [Eksik] Bütçe limiti uyarısı (D-16) görünümü tasarlanmadı.

type Row = { category: Category; usage: CategoryUsage };

export async function CategoryManagement({ tab }: { tab: CategoryTab }) {
  const [t, all, usageMap] = await Promise.all([getTranslations("categories"), listCategories(), getCategoryUsage()]);
  const inTab = all.filter((category) => (tab === "calendar" ? category.type === "calendar" : FINANCE_TYPES.includes(category.type)));
  const rows: Row[] = inTab.map((category) => ({ category, usage: usageMap.get(category.id) ?? { records: 0, recurring: 0 } }));
  const active = rows.filter((row) => !row.category.archived);
  const archived = rows.filter((row) => row.category.archived);
  const activeCount = (type: Category["type"]) => all.filter((category) => category.type === type && !category.archived).length;
  const newHref = newCategoryHref(tab === "calendar" ? "calendar" : "expense");

  const removeLabels = ({ category, usage }: Row) => {
    const common = { trigger: t("remove", { name: category.name }), cancel: t("removeDialog.cancel"), failed: t("removeDialog.failed") };
    if (activeCount(category.type) <= 1) {
      return { mode: "blocked" as const, labels: { ...common, title: t("removeDialog.blockedTitle"), body: t("removeDialog.blockedBody", { name: category.name }), confirm: t("removeDialog.close"), done: "" } };
    }
    if (usage.records + usage.recurring > 0) {
      return {
        mode: "archive" as const,
        labels: {
          ...common,
          title: t("removeDialog.archiveTitle"),
          body: t("removeDialog.archiveBody", { count: usage.records }),
          note: usage.recurring > 0 ? t("removeDialog.archiveRecurring", { count: usage.recurring }) : undefined,
          confirm: t("removeDialog.archiveConfirm"),
          done: t("removeDialog.archived"),
        },
      };
    }
    return { mode: "delete" as const, labels: { ...common, title: t("removeDialog.deleteTitle"), body: t("removeDialog.deleteBody", { name: category.name }), confirm: t("removeDialog.deleteConfirm"), done: t("removeDialog.deleted") } };
  };

  const countLabel = (row: Row) => (tab === "calendar" ? t("calendarRecords", { count: row.usage.records }) : t("records", { count: row.usage.records }));

  return (
    <>
      <div className="tablet:hidden">
        <FocusHeader title={t("title")} titleId="categories-title" back={{ href: "/profil", label: t("back") }} />
      </div>
      <PageContainer className="flex flex-col gap-(--layout-section-gap)">
        <div className="hidden items-center justify-between gap-12 tablet:flex">
          <div className="flex min-w-0 items-center gap-8">
            <Link
              href="/profil"
              aria-label={t("back")}
              className="touch-target inline-flex size-36 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-primary transition-colors hover:border-border-strong hover:bg-action-tertiary-hover"
            >
              <Icon icon="back" />
            </Link>
            <h1 className="truncate text-title-md text-text-primary">{t("title")}</h1>
          </div>
          <ButtonLink href={newHref} scroll={false} leadingIcon="add">
            {t("add")}
          </ButtonLink>
        </div>

        <SegmentedLinks
          label={t("tabs.label")}
          fullWidth
          className="tablet:max-w-[480px]"
          value={tab}
          options={[
            { value: "finance", label: t("tabs.finance"), href: categoriesHref("finance") },
            { value: "calendar", label: t("tabs.calendar"), href: categoriesHref("calendar") },
          ]}
        />

        <section aria-labelledby="categories-list" className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-12">
            <h2 id="categories-list" className="text-title-sm text-text-primary">
              {tab === "calendar" ? t("calendarTitle") : t("financeTitle")}
            </h2>
            <p className="text-caption-strong text-text-secondary">{t("total", { count: active.length })}</p>
          </div>
          {active.length === 0 ? (
            <p className="rounded-lg bg-surface-card p-16 text-body text-text-secondary shadow-elev-1">{t("empty")}</p>
          ) : (
            <ul className="grid grid-cols-1 gap-8 tablet:grid-cols-2 desktop:grid-cols-3">
              {active.map((row) => {
                const remove = removeLabels(row);
                return (
                  <li key={row.category.id} className="flex items-center justify-between gap-12 rounded-lg bg-surface-card p-12 shadow-elev-1">
                    <div className="flex min-w-0 items-center gap-12">
                      <CategoryIcon category={row.category} />
                      <div className="flex min-w-0 flex-col gap-2">
                        <span className="flex min-w-0 flex-wrap items-center gap-x-8 gap-y-2">
                          <span className="truncate text-body-strong text-text-primary">{row.category.name}</span>
                          <span className={cn("inline-flex h-24 shrink-0 items-center rounded-full px-8 text-caption-strong", categoryChipClass(row.category.color))}>
                            {t(`color.${row.category.color}`)}
                          </span>
                        </span>
                        <span className="text-caption text-text-secondary">
                          {tab === "finance" && `${t(`type.${row.category.type}`)} · `}
                          {countLabel(row)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-8">
                      <Link
                        href={editCategoryHref(row.category.id)}
                        scroll={false}
                        aria-label={t("edit", { name: row.category.name })}
                        className="touch-target inline-flex size-32 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary"
                      >
                        <Icon icon="edit" />
                      </Link>
                      <CategoryRemoveButton categoryId={row.category.id} mode={remove.mode} labels={remove.labels} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {archived.length > 0 && (
          <details className="group flex flex-col gap-8">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-12 rounded-md py-8 text-body-strong text-text-secondary [&::-webkit-details-marker]:hidden">
              {t("archived.title", { count: archived.length })}
              <span aria-hidden className="transition-transform group-open:rotate-180">
                <Icon icon="dropdown" size="sm" />
              </span>
            </summary>
            <ul className="mt-8 grid grid-cols-1 gap-8 tablet:grid-cols-2 desktop:grid-cols-3">
              {archived.map((row) => (
                <li key={row.category.id} className="flex items-center justify-between gap-12 rounded-lg border border-border-subtle bg-surface-card p-12">
                  <div className="flex min-w-0 items-center gap-12">
                    <CategoryIcon category={row.category} />
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="truncate text-body-strong text-text-secondary">{row.category.name}</span>
                      <span className="text-caption text-text-secondary">{countLabel(row)}</span>
                    </div>
                  </div>
                  <RestoreCategoryButton
                    categoryId={row.category.id}
                    labels={{
                      restore: t("archived.restore"),
                      restoreLabel: t("archived.restoreLabel", { name: row.category.name }),
                      restored: t("archived.restored"),
                      conflict: t("archived.conflict"),
                      failed: t("removeDialog.failed"),
                    }}
                  />
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="tablet:hidden">
          <ActionFooter>
            <ButtonLink href={newHref} scroll={false} leadingIcon="add">
              {t("add")}
            </ButtonLink>
          </ActionFooter>
        </div>
      </PageContainer>
    </>
  );
}
