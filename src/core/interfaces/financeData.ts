export type FinanceEntryType = "REVENUE" | "EXPENSE" | "CANCELED";

export interface FinanceEntry {
  name: string;
  value: number;
  createdAt: string;
  type: FinanceEntryType;
}

