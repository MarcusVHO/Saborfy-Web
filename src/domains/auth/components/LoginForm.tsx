import { ShoppingBag } from "lucide-react"

export function LoginForm() {
    return(
        <section>
            <form action="" className="flex flex-col shadow-lg p-4 rounded-lg bg-white border border-neutral-300">
                <div className="mx-auto w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white"/>
                </div>
                <input type="text" placeholder="Digite sua matricula"/>
                <input type="password" placeholder="Digite sua senha"/>
            </form>
        </section>
    )
}