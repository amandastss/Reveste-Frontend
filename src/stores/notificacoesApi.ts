import { defineStore } from 'pinia'
import axios from 'axios'

export interface Notification {
  id: number
  usuario: number
  mensagem: string
  lida: boolean
  data_envio: string
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    unreadNotifications: (state) =>
      state.notifications.filter((notification) => !notification.lida),

    unreadCount: (state) =>
      state.notifications.filter((notification) => !notification.lida).length,
  },

  actions: {
    async loadNotifications() {
      const token = localStorage.getItem('token')

      if (!token) {
        this.notifications = []
        return
      }

      this.loading = true
      this.error = null

      try {
        const res = await axios.get('/api/notificacoes/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('NOTIFICAÇÕES - resposta:', res.data)

        // Django REST Framework pode retornar:
        // [ ... ]
        // ou
        // { results: [ ... ] }

        if (Array.isArray(res.data)) {
          this.notifications = res.data
        } else if (Array.isArray(res.data.results)) {
          this.notifications = res.data.results
        } else {
          this.notifications = []
          console.error(
            'Formato inesperado das notificações:',
            res.data
          )
        }
      } catch (err) {
        console.error('Erro ao carregar notificações:', err)
        this.error = 'Não foi possível carregar as notificações.'
        this.notifications = []
      } finally {
        this.loading = false
      }
    },

    async markAsRead(id: number) {
      const token = localStorage.getItem('token')

      if (!token) return

      try {
        await axios.patch(
          `/api/notificacoes/${id}/`,
          {
            lida: true,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const notification = this.notifications.find(
          (item) => item.id === id
        )

        if (notification) {
          notification.lida = true
        }
      } catch (err) {
        console.error('Erro ao marcar notificação como lida:', err)
      }
    },

    async markAllAsRead() {
      const unread = this.notifications.filter(
        (notification) => !notification.lida
      )

      for (const notification of unread) {
        await this.markAsRead(notification.id)
      }
    },
  },
})