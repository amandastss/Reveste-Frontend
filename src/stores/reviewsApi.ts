import api from '@/api/config'

export default {
  async getReviews(produtoId: number) {
    return api.get(`/reviews/${produtoId}/`)
  },

  async createReview(produtoId: number, data: FormData) {
    return api.post(`/reviews/${produtoId}/`, data)
  }
}