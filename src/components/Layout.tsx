import { Outlet } from "react-router-dom";

export function Layout() {
    return (
        <div className="w-full h-dvh flex items-center justify-center bg-red-500">
            <h1 className="text-4xl font-bold text-gray-800">Bem-vindo ao Saborfy!</h1>
            <Outlet />
        </div>
    )
}