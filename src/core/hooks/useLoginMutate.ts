import { useMutation } from "@tanstack/react-query"
import { postLogin } from "../services/postLogin"


export function useLoginMutate() {

    const mutate = useMutation({
        mutationFn: postLogin,
        retry:false,
        
        onSuccess: (data) => {
            const token = data.token;
            localStorage.setItem("token", token);
            localStorage.setItem('isAuthenticated', 'true');

        },

        onError: () => {
            localStorage.removeItem('isAuthenticated');
        }
    })

    return mutate
}