import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMenu, postMenu, postMenuItem, deleteMenuItem, updateMenu, deleteMenu, updateMenuItem } from "../services/menuService";
import type { CreateMenuRequest, CreateMenuItemRequest } from "../interfaces/menuListData";

export function useMenuData() {
    return useQuery({
        queryKey: ["menu-data"],
        queryFn: getMenu,
    });
}

export function useCreateMenuMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateMenuRequest) => postMenu(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menu-data"] });
        },
    });
}

export function useUpdateMenuMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateMenuRequest }) => updateMenu(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menu-data"] });
        },
    });
}

export function useDeleteMenuMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteMenu(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menu-data"] });
        },
    });
}

export function useCreateMenuItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ menuId, data }: { menuId: number; data: CreateMenuItemRequest }) => postMenuItem(menuId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menu-data"] });
        },
    });
}

export function useUpdateMenuItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ menuId, itemId, data }: { menuId: number; itemId: number; data: CreateMenuItemRequest }) => updateMenuItem(menuId, itemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menu-data"] });
        },
    });
}

export function useDeleteMenuItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ menuId, itemId }: { menuId: number; itemId: number }) => deleteMenuItem(menuId, itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menu-data"] });
        },
    });
}
