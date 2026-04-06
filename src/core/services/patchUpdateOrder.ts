import { api } from "../config/axiosConfig"
import type { UpdateOrderRequest } from "../interfaces/updateOrderRequest"

export async function patchUpdateOrder(data: UpdateOrderRequest) {
  const response = await api.patch(`/order`, data, {params: {orderId: data.orderId}}) 
  return response.data
}