import { api } from "../config/axiosConfig"
import type { KanbanRequest } from "../interfaces/kanbanRequest"

export async function getOrderKanban(data: KanbanRequest) {
  const response = await api.get("/order/kanban", { params: data })
  return response.data
}