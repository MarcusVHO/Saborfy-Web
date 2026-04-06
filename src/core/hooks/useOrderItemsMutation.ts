import { useMutation, useQueryClient } from "@tanstack/react-query"
import { postOrderItem, deleteOrderItem } from "../services/orderItemsService"

export function useOrderItemsMutation() {
    const queryClient = useQueryClient();

    const addItems = useMutation({
        mutationFn: ({ orderId, items }: { orderId: number; items: { id: number; quantity: number }[] }) => 
            postOrderItem(orderId, items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders-data"] });
            queryClient.invalidateQueries({ queryKey: ["order-details"] });
        }
    })

    const removeItem = useMutation({
        mutationFn: ({ orderId, itemId }: { orderId: number; itemId: number }) => 
            deleteOrderItem(orderId, itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders-data"] });
            queryClient.invalidateQueries({ queryKey: ["order-details"] });
        }
    })

    return { addItems, removeItem }
}
