import { useMutation, useQueryClient } from "@tanstack/react-query"
import { patchUpdateOrder } from "../services/patchUpdateOrder"

export function useUpdateOrderMutation() {
    const queryClient = useQueryClient();

    const mutate = useMutation({
        mutationFn: patchUpdateOrder,
        retry:2,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders-data"] });
            queryClient.invalidateQueries({ queryKey: ["order-details"] });
        }
    })

    return mutate
}