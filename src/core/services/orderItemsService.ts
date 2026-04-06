import { api } from "../config/axiosConfig"

export async function postOrderItem(orderId: number, items: { id: number; quantity: number }[]) {
  const response = await api.post(`/order/item`, items, { params: { orderId } })
  return response.data
}

export async function deleteOrderItem(orderId: number, itemId: number) {
  const response = await api.delete(`/order/item?orderId=${orderId}&itemId=${itemId}`)
  return response.data
}
