import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default {
  async getReviews(produtoId: number) {
    return axios.get(`${API}/api/reviews/${produtoId}/`)
  },

  async createReview(produtoId: number, data: FormData) {
    return axios.post(`${API}/api/reviews/${produtoId}/`, data)
  }
}