import { api } from "../config/axiosConfig";

export async function putUpdateCustomer(id: number, name: string) {
    const response = await api.put(`/customer`, { name }, { params: { id } });
    return response.data;
}

export async function postCustomerAddress(customerId: number, data: { address: string; number: number; complement?: string | null }) {
    const response = await api.post(`/customer/address`, data, { params: { customerId } });
    return response.data;
}

export async function deleteCustomerAddress(customerId: number, addressId: number) {
    const response = await api.delete(`/customer/address`, { params: { customerId, addressId } });
    return response.data;
}

export async function postCustomerPhone(customerId: number, number: string) {
    const response = await api.post(`/customer/phone`, { number }, { params: { customerId } });
    return response.data;
}

export async function deleteCustomerPhone(customerId: number, phoneId: number) {
    const response = await api.delete(`/customer/phone`, { params: { customerId, phoneId } });
    return response.data;
}
