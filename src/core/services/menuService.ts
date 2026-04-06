import { api } from "../config/axiosConfig";
import type { MenuListData, CreateMenuRequest, CreateMenuItemRequest } from "../interfaces/menuListData";

export async function getMenu() {
    const response = await api.get<MenuListData[]>("/menu");
    return response.data;
}

export async function postMenu(data: CreateMenuRequest) {
    const response = await api.post("/menu", data);
    return response.data;
}

export async function postMenuItem(menuId: number, data: CreateMenuItemRequest) {
    const response = await api.post(`/menu/item?menuId=${menuId}`, data);
    return response.data;
}

export async function updateMenu(id: number, data: CreateMenuRequest) {
    const response = await api.put(`/menu?id=${id}`, data);
    return response.data;
}

export async function deleteMenu(id: number) {
    const response = await api.delete(`/menu?id=${id}`);
    return response.data;
}

export async function updateMenuItem(menuId: number, itemId: number, data: CreateMenuItemRequest) {
    const response = await api.patch(`/menu/item?menuId=${menuId}&id=${itemId}`, data);
    return response.data;
}

export async function deleteMenuItem(menuId: number, itemId: number) {
    const response = await api.delete(`/menu/item?menuId=${menuId}&itemId=${itemId}`);
    return response.data;
}
