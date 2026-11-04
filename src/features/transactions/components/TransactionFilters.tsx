import { getTranslations } from "next-intl/server";
import { ChipLink } from "@/components/ui/ChipSelect";
import { SegmentedLinks } from "@/components/ui/SegmentedControl";
import type { Category } from "@/features/categories";
import type { TransactionType } from "../domain/types";
import { listHref, type ListQuery } from "../routes";

// Pages → İşlemler filtreleri: Tümü / Gelir / Gider segmented control + kategori çipleri (Chip-Kategori).
// Mobil: çipler yatay kaydırılır; tablet+: alt satıra geçer (RESPONSIVE §3.3.1).
// Çip listesi: seçili dönemde ve türde kullanılmış kategoriler.

type TransactionFiltersProps = {
  query: ListQuery;
  categories: Category[];
};

export async function TransactionFilters({ query, categories }: TransactionFiltersProps) {
  const t = await getTranslations("transactions.filter");
  const base = { month: query.month };

  const typeOptions: { value: TransactionType | "all"; label: string; href: string }[] = [
    { value: "all", label: t("all"), href: listHref(base) },
    { value: "income", label: t("income"), href: listHref({ ...base, type: "income" }) },
    { value: "expense", label: t("expense"), href: listHref({ ...base, type: "expense" }) },
  ];

  return (
    <div className="flex flex-col gap-12">
      <SegmentedLinks options={typeOptions} value={query.type ?? "all"} label={t("type")} fullWidth className="tablet:w-auto tablet:self-start" />

      {categories.length > 0 && (
        <nav aria-label={t("categories")} className="-mx-(--layout-page-padding-x) overflow-x-auto px-(--layout-page-padding-x) [scrollbar-width:none] tablet:mx-0 tablet:overflow-visible tablet:px-0">
          <ul className="flex gap-8 tablet:flex-wrap">
            <li>
              <ChipLink href={listHref({ ...base, type: query.type })} scroll={false} selected={!query.categoryId}>
                {t("allCategories")}
              </ChipLink>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <ChipLink href={listHref({ ...base, type: query.type, categoryId: category.id })} scroll={false} selected={query.categoryId === category.id}>
                  {category.name}
                </ChipLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
