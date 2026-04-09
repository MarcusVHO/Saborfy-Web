import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginView } from "@/app/container/Login.view";
import { OrderView } from "@/app/container/Order.view";
import { CustomerView } from "@/app/container/Customer.view";
import { MenuView } from "@/app/container/MenuView";
import { FinanceView } from "@/app/container/Finance.view";
import { DashboardView } from "@/app/container/Dashboard.view";

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
                element: <DashboardView />
            },
            {
                path: "orders",
                element: <OrderView />
            },
            {
                path: "customers",
                element: <CustomerView />
            },
            {
                path: "menu",
                element: <MenuView />
            },
            {
                path: "finance",
                element: <FinanceView />
            }
        ]
    }
])
