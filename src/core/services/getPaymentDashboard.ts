import { api } from "../config/axiosConfig";
import type { PaymentDashboardData } from "../interfaces/paymentDashboardData";

export async function getPaymentDashboard(params: { startDate: Date; endDate: Date }) {
  const response = await api.get<PaymentDashboardData>("/payment/dashboard", {
    params: {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    },
  });
  return response.data;
}

