import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFinance, getFinanceAvg, getFinanceExpense, getFinanceRevenue, postFinanceExpense } from "../services/financeService";
import type { CreateFinanceExpenseRequest } from "../interfaces/createFinanceExpenseRequest";

export function useFinanceEntries(params: { startDate: Date; endDate: Date }) {
  return useQuery({
    queryKey: ["finance", params.startDate.toISOString(), params.endDate.toISOString()],
    queryFn: () => getFinance(params),
  });
}

export function useFinanceRevenue(params: { startDate: Date; endDate: Date }) {
  return useQuery({
    queryKey: ["finance-revenue", params.startDate.toISOString(), params.endDate.toISOString()],
    queryFn: () => getFinanceRevenue(params),
  });
}

export function useFinanceExpense(params: { startDate: Date; endDate: Date }) {
  return useQuery({
    queryKey: ["finance-expense", params.startDate.toISOString(), params.endDate.toISOString()],
    queryFn: () => getFinanceExpense(params),
  });
}

export function useFinanceAvg(params: { startDate: Date; endDate: Date }) {
  return useQuery({
    queryKey: ["finance-avg", params.startDate.toISOString(), params.endDate.toISOString()],
    queryFn: () => getFinanceAvg(params),
  });
}

export function useCreateFinanceExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFinanceExpenseRequest) => postFinanceExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      queryClient.invalidateQueries({ queryKey: ["finance-revenue"] });
      queryClient.invalidateQueries({ queryKey: ["finance-expense"] });
      queryClient.invalidateQueries({ queryKey: ["finance-avg"] });
    },
  });
}

