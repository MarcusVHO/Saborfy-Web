import { api } from "../config/axiosConfig";
import type { CreateOrderRequest } from "../interfaces/createOrderRequest";

export async function postOrder(data: CreateOrderRequest) {
    const response = await api.post("/order", data);
    return response.data;
}
