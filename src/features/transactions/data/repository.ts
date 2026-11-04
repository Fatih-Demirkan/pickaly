import type { MonthKey } from "@/lib/dates";
import type { RecurringRule, Transaction, TransactionInput, TransactionOrigin } from "../domain/types";

/**
 * İşlem veri erişimi sözleşmesi. Ekranlar yalnızca bu arayüzü bilir; yerel örnek veri deposu
 * Supabase repository'si ile değiştirildiğinde bileşenler değişmez (TECH_STACK §2).
 */
export interface TransactionRepository {
  listByMonth(month: MonthKey): Promise<Transaction[]>;
  listAll(): Promise<Transaction[]>;
  get(id: string): Promise<Transaction | null>;
  /** Kaynak verilmezse elle girilmiş kayıttır. */
  create(input: TransactionInput, origin?: Partial<TransactionOrigin>): Promise<Transaction>;
  update(id: string, input: TransactionInput): Promise<Transaction | null>;
  remove(id: string): Promise<boolean>;
}

export interface RecurringRuleRepository {
  listActive(): Promise<RecurringRule[]>;
  get(id: string): Promise<RecurringRule | null>;
  create(rule: Omit<RecurringRule, "id">): Promise<RecurringRule>;
  markGenerated(id: string, through: string): Promise<void>;
}
