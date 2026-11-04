import type { SavingsAccount, SavingsMovement } from "../domain/types";

/** Birikim hesabı ve hareket veri erişimi sözleşmesi (TECH_STACK §2). */
export interface SavingsRepository {
  listAccounts(): Promise<SavingsAccount[]>;
  getAccount(id: string): Promise<SavingsAccount | null>;
  createAccount(account: Omit<SavingsAccount, "id">): Promise<SavingsAccount>;
  updateAccount(id: string, patch: Partial<Omit<SavingsAccount, "id">>): Promise<SavingsAccount | null>;
  removeAccount(id: string): Promise<void>;
  listMovements(accountId?: string): Promise<SavingsMovement[]>;
  createMovement(movement: Omit<SavingsMovement, "id">): Promise<SavingsMovement>;
}
