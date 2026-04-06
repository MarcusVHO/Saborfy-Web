import axios from "axios";
import { notify } from "@/core/notification/notificationHandler";

export const api = axios.create({
  baseURL: "http://localhost:8080"
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (!config.url?.includes("/auth") && token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Erro inesperado"

    if (error.response) {
      const data = error.response.data
        
      // tenta extrair melhor mensagem possível
      message =
        data?.message ||
        data?.error ||
        `Erro ${data?.status}` ||
        message

      // 🔐 tratamento específico
      if (error.response.status === 401) {
        localStorage.removeItem("token")
      }

      if (error.response.status === 403) {
        localStorage.removeItem("token")
        localStorage.removeItem("isAuthenticated")
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"
        }
        return Promise.reject(error)
      }
    } else {
      message = "Erro de conexão com servidor"
    }

    notify({
      type: "error",
      message
    })

    return Promise.reject(error)
  }
)
