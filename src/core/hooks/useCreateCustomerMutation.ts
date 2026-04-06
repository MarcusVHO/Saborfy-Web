import { useMutation } from "@tanstack/react-query";
import { postCustomer } from "../services/postCustomer";

export function useCreateCustomerMutation() {
    const mutate = useMutation({
        mutationFn: postCustomer,
    });

    return mutate;
}
