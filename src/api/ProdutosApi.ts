import axios from "axios"

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/"
})

export const getProdutos = async () => {
  const response = await api.get("produtos/")
  return response.data
}
