import { Chip } from "@/components/ui/Chip";
import type { DueState } from "../domain/schedule";
import type { PaymentStatus } from "../domain/types";

// Pages → Ödeme Detayı durum çipi: "Bekliyor" Turuncu (Category/Orange + Semantic/Yaklaşan), noktasız.
// [Varsayım] "Ödendi" Yeşil, "Gecikmiş" (BR-PAY-005) Semantic/Gider - Hata tonları; Pages'ta çizilmedi.

type PaymentStatusChipProps = {
  status: PaymentStatus;
  due: DueState;
  labels: { pending: string; paid: string; overdue: string };
};

export function PaymentStatusChip({ status, due, labels }: PaymentStatusChipProps) {
  if (status === "paid") return <Chip variant="success">{labels.paid}</Chip>;
  if (due.kind === "overdue") return <Chip className="bg-status-danger-subtle text-text-danger">{labels.overdue}</Chip>;
  return <Chip variant="warning">{labels.pending}</Chip>;
}

/** "payments.due.*" çeviri anahtarı ve değerleri. */
export function dueMessage(due: DueState): { key: "overdue" | "today" | "inDays"; values: Record<string, number> } {
  if (due.kind === "overdue") return { key: "overdue", values: { count: due.days } };
  if (due.kind === "today") return { key: "today", values: {} };
  return { key: "inDays", values: { count: due.days } };
}
