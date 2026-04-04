import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginView } from "@/app/container/Login.view";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginView/>
    },
    {
        path:"/",
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <h1>Home</h1>
            }
        ]
    }
])