export interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    createBy: string;
    latestUpdateBy: string | null;
    createdAt: string;
}

export interface MenuListData {
    id: number;
    name: string;
    items: MenuItem[];
    createBy: string;
    LatestUpdateBy: string;
    createdAt: string;
}

export interface CreateMenuRequest {
    name: string;
}

export interface CreateMenuItemRequest {
    name: string;
    price: number;
    description: string;
}
