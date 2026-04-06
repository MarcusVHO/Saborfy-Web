import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    postPayment, 
    deletePayment, 
    patchPayment, 
    patchPaymentStatus,
} from "../services/paymentService";
import type { PaymentMethod, PaymentStatus } from "../services/paymentService";

export function usePaymentMutation() {
    const queryClient = useQueryClient();

    const addPayment = useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: { amount: number; method: PaymentMethod } }) => 
            postPayment(orderId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders-data"] });
            queryClient.invalidateQueries({ queryKey: ["order-details"] });
        }
    });

    const removePayment = useMutation({
        mutationFn: ({ orderId, paymentId }: { orderId: number; paymentId: number }) => 
            deletePayment(orderId, paymentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders-data"] });
            queryClient.invalidateQueries({ queryKey: ["order-details"] });
        }
    });

    const updatePayment = useMutation({
        mutationFn: ({ orderId, paymentId, data }: { orderId: number; paymentId: number; data: { amount: number; method: PaymentMethod } }) => 
            patchPayment(orderId, paymentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders-data"] });
            queryClient.invalidateQueries({ queryKey: ["order-details"] });
        }
    });

    const updateStatus = useMutation({
        mutationFn: ({ orderId, paymentId, status }: { orderId: number; paymentId: number; status: PaymentStatus }) => 
            patchPaymentStatus(orderId, paymentId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders-data"] });
            queryClient.invalidateQueries({ queryKey: ["order-details"] });
        }
    });

    return {
        addPayment,
        removePayment,
        updatePayment,
        updateStatus
    };
}
