export interface CreateCustomerRequest {
    name: string;
    addresses: {
        address: string;
        number: number;
        complement?: string | null;
    }[];
    phones: {
        number: string;
    }[];
}
