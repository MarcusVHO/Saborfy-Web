import { api } from "../config/axiosConfig";
import type { OrderFilterData } from "../interfaces/orderFilterData";

export async function getOrders(data:OrderFilterData) {
    const response = await api.post("/order/list", data);
    return response.data;
}