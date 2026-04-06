import { api } from "../config/axiosConfig";
import type { CreateCustomerRequest } from "../interfaces/createCustomerRequest";

export async function postCustomer(data: CreateCustomerRequest) {
    const response = await api.post("/customer", data);
    return response.data;
}
