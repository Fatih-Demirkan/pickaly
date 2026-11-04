import "server-only";
import type { Account } from "./domain/types";
import { mockAccounts } from "./data/mock-accounts";

// Hesap verisine sunucu tarafı erişim. Şimdilik yerel örnek veri.

export async function listAccounts(): Promise<Account[]> {
  return mockAccounts;
}

export async function getAccountMap(): Promise<Map<string, Account>> {
  return new Map(mockAccounts.map((account) => [account.id, account]));
}
