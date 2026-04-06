import { api } from "../config/axiosConfig"

export async function getOrderDetails(orderId: number) {
  const response = await api.get(`/order/${orderId}`)
  return response.data
}
