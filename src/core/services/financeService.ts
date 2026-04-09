import { api } from "../config/axiosConfig";
import type { CreateFinanceExpenseRequest } from "../interfaces/createFinanceExpenseRequest";
import type { FinanceEntry } from "../interfaces/financeData";

export async function getFinance(params: { startDate: Date; endDate: Date }) {
  const response = await api.get<FinanceEntry[]>("/finance", {
    params: {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    },
  });
  return response.data;
}

export async function getFinanceRevenue(params: { startDate: Date; endDate: Date }) {
  const response = await api.get<number>("/finance/revenue", {
    params: {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    },
  });
  return response.data;
}

export async function getFinanceExpense(params: { startDate: Date; endDate: Date }) {
  const response = await api.get<number>("/finance/expense", {
    params: {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    },
  });
  return response.data;
}

export async function getFinanceAvg(params: { startDate: Date; endDate: Date }) {
  const response = await api.get<number>("/finance/avg", {
    params: {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    },
  });
  return response.data;
}

export async function postFinanceExpense(data: CreateFinanceExpenseRequest) {
  const response = await api.post("/finance/expense", data);
  return response.data;
}

