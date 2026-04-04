import axios from "axios";
import { notify } from "@/core/notification/notificationHandler";

export const api = axios.create({
  baseURL: "http://arcanus.vps-kinghost.net:8080"
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
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