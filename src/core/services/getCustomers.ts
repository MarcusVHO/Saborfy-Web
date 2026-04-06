import { api } from "../config/axiosConfig";
import type { CustomerListData } from "../interfaces/customerListData";

export async function getCustomers(name?: string) {
    const response = await api.get<CustomerListData[]>("/customer", {
        params: { name }
    });
    return response.data;
}
