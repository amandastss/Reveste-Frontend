import { defineStore } from 'pinia'
import { loginRequest, registerRequest } from '@/api/authApi'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        const response = await loginRequest(email, password)

        this.user = response.data.user
        this.token = response.data.token

        // salvar no localStorage
        localStorage.setItem('token', this.token)

      // oxlint-disable-next-line no-unused-vars
      } catch (err) {
        this.error = 'Erro ao fazer login'
      } finally {
        this.loading = false
      }
    },

    async register(email, password) {
      this.loading = true
      this.error = null

      try {
        await registerRequest(email, password)
      // oxlint-disable-next-line no-unused-vars
      } catch (err) {
        this.error = 'Erro ao registrar'
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
