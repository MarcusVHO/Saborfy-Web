export type PaymentMethod = "PIX" | "CASH" | "DEBIT_CARD" | "CREDIT_CARD";
export type PaymentStatus = "PENDING" | "APPROVED" | "FAILED" | "CANCELED" | "REFUNDED" | "PARTIALLY_PAID";

export interface PaymentDashboardRecentItem {
  id: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

export type PaymentDashboardLast7Point = [string, number];

export interface PaymentDashboardData {
  recent: PaymentDashboardRecentItem[];
  avg: number;
  revenue: number;
  last7: PaymentDashboardLast7Point[];
}

