export interface UpdateOrderRequest {
    orderId: number,
    addressId?: number | null,
    observation?: string | null,
    status?: ("CREATED" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELED" | "COMPLETED") | null,
}
