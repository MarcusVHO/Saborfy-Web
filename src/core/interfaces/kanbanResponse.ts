import type { OrderListData } from "./orderListData"

export interface KanbanResponse {
    created: OrderListData[],
    confirmed: OrderListData[],
    preparing: OrderListData[],
    outForDelivery: OrderListData[],
    completed: OrderListData[],
    canceled: OrderListData[]
}