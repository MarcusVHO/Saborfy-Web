import { LoginCard } from "../features/LoginCard";

export function LoginView() {
    return (
        <div className="w-full h-dvh flex justify-center items-center min-h-screen  bg-linear-to-br from-orange-50 to-red-100">
            <LoginCard />
        </div>
    )
}