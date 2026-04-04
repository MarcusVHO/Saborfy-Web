import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { notify } from "@/core/notification/notificationHandler";
import { useLoginMutate } from "@/core/hooks/useLoginMutate";
import { cn } from "@/core/lib/utils";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function LoginCard() {
    const { mutate, isPending} = useLoginMutate()
    const [registration, setRegistration] = useState("")
    const [password, setPassword] = useState("")
    const[error, setError] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(false)
        const data = {
            registration: Number(registration),
            password: password
        }
        mutate(data, {
            onSuccess: () => {
                notify({
                type: "success",
                message: "Login realizado com sucesso"
                })

                navigate("/home")
            },
            
        })

    }
    
   

    return (
        <Card className="w-full max-w-sm ">
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white" />
                 </div>
                <CardTitle>SaborFy</CardTitle>
                <CardDescription>
                    Insira suas credenciais para acessar sua conta.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <label htmlFor="matricula">Matricula</label>
                            <Input
                                id="matricula"
                                type="text"
                                placeholder="Digite sua matrícula"
                                className={cn(`bg-gray-200 p-2 rounded-md`, error && " border-red-500")}
                                value={registration}
                                onChange={e => setRegistration(e.target.value)}
                                disabled={isPending}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <label htmlFor="password">Senha</label>
                                <a
                                    href="#"
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline opacity-50"
                                >
                                    Esqueceu sua senha?
                                </a>
                            </div>
                            <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className={cn(`bg-gray-200 p-2 rounded-md`, error && " border-red-500")}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    disabled={isPending}
                                />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-orange-600 hover:bg-orange-700 py-3 my-4 rounded-lg hover:cursor-pointer text-white font-bold" 
                        disabled={isPending}>
                        {isPending ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </CardContent> 
        </Card>
    )
}