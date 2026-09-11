import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL ?? "https://reveste-backend.class.fabricadesoftware.ifc.edu.br"

const api = axios.create({
  baseURL: `${API_BASE}/api`,
})

export const getProdutos = async () => {
  const response = await api.get("produtos/")
  return response.data
}
