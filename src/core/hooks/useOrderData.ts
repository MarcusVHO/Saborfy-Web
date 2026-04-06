import { useQuery } from "@tanstack/react-query";
import { getOrders as postOrders } from "../services/postOrders";
import type { OrderFilterData } from "../interfaces/orderFilterData";
import type { OrderListData } from "../interfaces/orderListData";

export function useOrderData(filters: OrderFilterData) {
    const {data} = useQuery<OrderListData[]>({
        queryKey: ["orders-data", filters],
        queryFn: () => postOrders(filters),
    })

    return {data};
}