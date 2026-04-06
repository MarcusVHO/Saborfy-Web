import { api } from "../config/axiosConfig";

export type PaymentMethod = "PIX" | "CASH" | "DEBIT_CARD" | "CREDIT_CARD";
export type PaymentStatus = "PENDING" | "APPROVED" | "FAILED" | "CANCELED" | "REFUNDED" | "PARTIALLY_PAID";

export async function postPayment(orderId: number, data: { amount: number; method: PaymentMethod }) {
    const response = await api.post(`/payment`, data, { params: { orderId } });
    return response.data;
}

export async function deletePayment(orderId: number, paymentId: number) {
    const response = await api.delete(`/payment`, { params: { orderId, paymentId } });
    return response.data;
}

export async function patchPayment(orderId: number, paymentId: number, data: { amount: number; method: PaymentMethod }) {
    const response = await api.patch(`/payment`, data, { params: { orderId, paymentId } });
    return response.data;
}

export async function patchPaymentStatus(orderId: number, paymentId: number, status: PaymentStatus) {
    const response = await api.patch(`/payment/status`, { status }, { params: { orderId, paymentId } });
    return response.data;
}
