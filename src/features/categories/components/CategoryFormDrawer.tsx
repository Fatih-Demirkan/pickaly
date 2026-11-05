import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { isLocale } from "@/i18n/config";
import { formatMoneyInput } from "@/lib/money";
import type { CategoryType } from "../domain/types";
import { categoriesHref, tabOfType } from "../routes";
import { getCategory } from "../server";
import { CategoryForm, type CategoryFormValues } from "./CategoryForm";

// Kategori Ekle / Düzenle sunumu (RESPONSIVE §3.6.2): mobil tam sayfa · tablet+ sağ drawer 560 px.
// Header "Yeni Kategori Ekle" + "× İptal" (Pages).

type CategoryFormDrawerProps = { mode: "create"; type: CategoryType } | { mode: "edit"; id: string };

export async function CategoryFormDrawer(props: CategoryFormDrawerProps) {
  const [t, rawLocale] = await Promise.all([getTranslations("categories.form"), getLocale()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";

  let initialValues: CategoryFormValues;
  if (props.mode === "edit") {
    const category = await getCategory(props.id);
    if (!category) notFound();
    initialValues = {
      type: category.type,
      name: category.name,
      // [Varsayım] İkonsuz eski kategori düzenlenirken ızgaranın ilk ikonu seçili gelir.
      icon: category.icon ?? "birdhouse",
      color: category.color,
      budget: category.monthlyBudgetMinor ? formatMoneyInput(category.monthlyBudgetMinor, locale) : "",
      note: category.note ?? "",
    };
  } else {
    // Pages: yeni kategori formunda ilk ikon ve Turkuaz seçili gelir.
    initialValues = { type: props.type, name: "", icon: "birdhouse", color: "teal", budget: "", note: "" };
  }

  const cancelHref = categoriesHref(tabOfType(initialValues.type));
  const titleId = "category-form-title";

  return (
    <Drawer closeHref={cancelHref} closeLabel={t("cancel")} labelledBy={titleId} size="form">
      <FocusHeader
        title={props.mode === "create" ? t("newTitle") : t("editTitle")}
        titleId={titleId}
        trailing={
          <Link
            href={cancelHref}
            scroll={false}
            className="touch-target -me-8 inline-flex h-40 items-center gap-4 rounded-full px-8 text-body-strong text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary"
          >
            <Icon icon="close" size="sm" />
            {t("cancel")}
          </Link>
        }
      />
      <DrawerBody>
        <CategoryForm categoryId={props.mode === "edit" ? props.id : undefined} initialValues={initialValues} cancelHref={cancelHref} />
      </DrawerBody>
    </Drawer>
  );
}
