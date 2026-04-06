export interface CustomerAddress {
    id: number;
    address: string;
    number: number;
    complement: string | null;
    createdAt: string;
}

export interface CustomerPhone {
    id: number;
    number: string;
    createdAt: string;
}

export interface CustomerListData {
    id: number;
    name: string;
    phones: CustomerPhone[];
    addresses: CustomerAddress[];
}
