import { useQuery } from "@tanstack/react-query";
import { getOrderDetails } from "../services/getOrderDetails";

export function useOrderDetails(orderId: number | null) {
    return useQuery({
        queryKey: ["order-details", orderId],
        queryFn: () => getOrderDetails(orderId!),
        enabled: !!orderId,
    });
}
