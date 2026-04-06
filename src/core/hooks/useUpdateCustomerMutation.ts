import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    putUpdateCustomer, 
    postCustomerAddress, 
    deleteCustomerAddress, 
    postCustomerPhone, 
    deleteCustomerPhone 
} from "../services/updateCustomerService";

export function useUpdateCustomerMutation() {
    const queryClient = useQueryClient();

    const updateName = useMutation({
        mutationFn: ({ id, name }: { id: number; name: string }) => putUpdateCustomer(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers-data"] });
        }
    });

    const addAddress = useMutation({
        mutationFn: ({ customerId, data }: { customerId: number; data: { address: string; number: number; complement?: string | null } }) => 
            postCustomerAddress(customerId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers-data"] });
        }
    });

    const removeAddress = useMutation({
        mutationFn: ({ customerId, addressId }: { customerId: number; addressId: number }) => 
            deleteCustomerAddress(customerId, addressId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers-data"] });
        }
    });

    const addPhone = useMutation({
        mutationFn: ({ customerId, number }: { customerId: number; number: string }) => 
            postCustomerPhone(customerId, number),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers-data"] });
        }
    });

    const removePhone = useMutation({
        mutationFn: ({ customerId, phoneId }: { customerId: number; phoneId: number }) => 
            deleteCustomerPhone(customerId, phoneId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers-data"] });
        }
    });

    return {
        updateName,
        addAddress,
        removeAddress,
        addPhone,
        removePhone
    };
}
