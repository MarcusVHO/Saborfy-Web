import type { KanbanRequest } from "../interfaces/kanbanRequest";
import type { KanbanResponse } from "../interfaces/kanbanResponse";
import { useQuery } from "@tanstack/react-query";
import { getOrderKanban } from "../services/getOrderKanban";

export function useOrderKanban(request: KanbanRequest) {
    const {data} = useQuery<KanbanResponse>({
        queryKey: ["orders-data", request],
        queryFn: () => getOrderKanban(request),
    })

    return {data};
}