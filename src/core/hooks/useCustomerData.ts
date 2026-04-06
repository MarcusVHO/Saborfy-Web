import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "../services/getCustomers";
import type { CustomerListData } from "../interfaces/customerListData";

export function useCustomerData(name?: string) {
    const { data, isLoading, error, refetch } = useQuery<CustomerListData[]>({
        queryKey: ["customers-data", name],
        queryFn: () => getCustomers(name),
    });

    return { data, isLoading, error, refetch };
}
