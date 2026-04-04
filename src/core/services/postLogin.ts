import { api } from "../config/axiosConfig";
import type { LoginData } from "../interfaces/loginData";


export async function postLogin(data: LoginData) {
  const response = await api.post("/auth/login", data)
  return response.data
}