// savings modülünün (Birikimler) istemci tarafında da kullanılabilen genel arayüzü.
// Veri erişimi (sunucu) için "@/features/savings/server" kullanılır.

export { progressPercent, type SavingsAccount, type SavingsAccountView, type SavingsKind, type SavingsUnit } from "./domain/types";
export { formatSavingsAmount, formatSavingsShort } from "./format";
export { savingsHref } from "./routes";
