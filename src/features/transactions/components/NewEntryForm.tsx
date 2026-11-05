"use client";

import { useState } from "react";
import type { AccountOption } from "@/features/accounts/components/AccountPicker";
import { ItemForm, type ItemFormValues } from "@/features/calendar/components/ItemForm";
import type { Category } from "@/features/categories";
import type { NewEntryType } from "../routes";
import type { TransactionFormType } from "../schemas";
import { EntryTypeField } from "./EntryTypeField";
import { TransactionForm, type TransactionFormValues } from "./TransactionForm";

// Yeni İşlem sheet'inin içeriği (ürün sahibi kararı 2026-11-05): üstte Gelir · Gider · Görev · Ödeme seçimi.
//   Gelir / Gider / Ödeme → Yeni İşlem formu (aralarında geçişte girilen değerler korunur).
//   Görev → Görev Ekle formu (Takvim ile aynı form; kayıt Takvim'e düşer).
// İki form arasında geçişte diğer formun girilmiş değerleri sıfırlanır (iki ayrı kayıt türü).

type NewEntryFormProps = {
  initialType: NewEntryType;
  transaction: { initialValues: TransactionFormValues; categories: Category[]; accounts: AccountOption[] };
  task: { initialValues: ItemFormValues; categories: Category[] };
  cancelHref: string;
};

export function NewEntryForm({ initialType, transaction, task, cancelHref }: NewEntryFormProps) {
  const [type, setType] = useState<NewEntryType>(initialType);

  if (type === "task") {
    return (
      <ItemForm
        mode="create"
        initialValues={task.initialValues}
        categories={task.categories}
        cancelHref={cancelHref}
        leading={<EntryTypeField value="task" onChange={setType} />}
      />
    );
  }

  const formType: TransactionFormType = type;
  return (
    <TransactionForm
      mode="create"
      initialValues={{ ...transaction.initialValues, type: formType, repeat: formType === "subscription" }}
      categories={transaction.categories}
      accounts={transaction.accounts}
      cancelHref={cancelHref}
      onSelectTask={() => setType("task")}
    />
  );
}
