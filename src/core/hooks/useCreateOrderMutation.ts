import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postOrder } from "../services/postOrder";
import type { CreateOrderRequest } from "../interfaces/createOrderRequest";

export function useCreateOrderMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateOrderRequest) => postOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders-data"] });
        },
    });
}
