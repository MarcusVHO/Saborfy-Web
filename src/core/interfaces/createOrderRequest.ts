export interface CreateOrderItemRequest {
    id: number;
    quantity: number;
}

export interface CreateOrderRequest {
    customerId: number;
    addressId: number;
    observation: string | null;
    items: CreateOrderItemRequest[];
}
