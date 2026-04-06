import { useQuery } from "@tanstack/react-query";
import { getPaymentDashboard } from "../services/getPaymentDashboard";

export function usePaymentDashboard(params: { startDate: Date; endDate: Date }) {
  return useQuery({
    queryKey: ["payment-dashboard", params.startDate.toISOString(), params.endDate.toISOString()],
    queryFn: () => getPaymentDashboard(params),
  });
}

