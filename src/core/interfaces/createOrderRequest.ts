export interface CreateOrderItemRequest {
    id: number;
    quantity: number;
}

export type CreateOrderPaymentMethod = "PIX" | "CASH" | "DEBIT_CARD" | "CREDIT_CARD";

export interface CreateOrderPaymentRequest {
    amount: number;
    method: CreateOrderPaymentMethod;
}

export interface CreateOrderRequest {
    customerId: number;
    addressId: number | null;
    observation: string | null;
    items: CreateOrderItemRequest[];
    payments: CreateOrderPaymentRequest[];
}
