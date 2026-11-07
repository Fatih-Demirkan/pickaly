import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import type { DateKey } from "@/lib/dates";
import { isOverdue, type Loan } from "../domain/types";

// Alacak durum çipi (DESIGN_SYSTEM_PICKALY §5.4 durum chip'i): Geri alındı (success) · Gecikti (danger) · Açık (warning).

export async function LoanStatusChip({ loan, today }: { loan: Loan; today: DateKey }) {
  const t = await getTranslations("loans.status");
  if (loan.repaidOn) return <Chip variant="success">{t("repaid")}</Chip>;
  if (isOverdue(loan, today)) return <Chip variant="danger">{t("overdue")}</Chip>;
  return <Chip variant="warning">{t("open")}</Chip>;
}
