<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface Notification {
  id: number;
  type: 'promo' | 'delivery' | 'stock';
  title: string;
  message: string;
  time: string;
  read: boolean;
  route?: string;
}

const router = useRouter()

const notifications = ref<Notification[]>([
  {
    id: 1,
    type: 'promo',
    title: '20% OFF na Coleção Vintage!',
    message: 'Use o código VINTAGE20 e aproveite descontos exclusivos.',
    time: 'Há 2 horas',
    read: false,
    route: '/search'
  },
  {
    id: 2,
    type: 'delivery',
    title: 'Pedido saiu para entrega',
    message: 'Seu casaco de moletom preto está a caminho e chega hoje!',
    time: 'Há 5 horas',
    read: false,
    route: '/pedidos'
  },
  {
    id: 3,
    type: 'stock',
    title: 'Um item do seu carrinho esgotou',
    message: 'A "Camiseta Básica polo branca" foi vendida.',
    time: 'Ontem',
    read: true,
    route: '/cart'
  },
  {
    id: 4,
    type: 'delivery',
    title: 'Pedido entregue!',
    message: 'Seu pedido #8472 foi entregue com sucesso.',
    time: '23/06/2026',
    read: true,
    route: '/reviews'
  }
])

const goBack = () => {
  router.go(-1)
}

const handleNotificationClick = (notif: Notification) => {
  notif.read = true
  if (notif.route) router.push(notif.route)
}
</script>
<template>
  <div class="notifications-page">
    <header class="notifications-header">
      <button @click="goBack" class="back-btn" aria-label="Voltar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      <h1 class="page-title">Notificações</h1>
    </header>

    <main class="notifications-list">
      <div v-for="notif in notifications" :key="notif.id" :class="['notification-card', { 'unread': !notif.read }]"
        @click="handleNotificationClick(notif)">
        <div :class="['icon-wrapper', notif.type]">
          <svg v-if="notif.type === 'promo'" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          <svg v-if="notif.type === 'delivery'" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          <svg v-if="notif.type === 'stock'" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <div class="notification-content">
          <h3>{{ notif.title }}</h3>
          <p>{{ notif.message }}</p>
          <span class="time-ago">{{ notif.time }}</span>
        </div>

        <div v-if="!notif.read" class="unread-dot"></div>
      </div>
    </main>
  </div>
</template>
<style scoped>
.notifications-page {
  background-color: var(--surface-bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 24px;
    font-family: "Montserrat", sans-serif;
}

/* =========================================
   HEADER (PADRONIZADO COM O CARRINHO)
   ========================================= */
.notifications-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 35px;
}

.back-btn {
  position: absolute;
  left: 0;
  border: none;
  background: transparent;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  color: var(--text-color);
}

.back-btn:hover {
  opacity: 0.6;
}

.page-title {
  font-size: 1.7rem;
  font-weight: 500;
  margin: 0;
  color: var(--text-color);
  letter-spacing: -0.5px;
}

/* =========================================
   LISTA DE NOTIFICAÇÕES
   ========================================= */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  padding: 18px;
  background-color: var(--surface-bg);
  border: 1px solid #eeeeee;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.notification-card.unread {
  border-color: var(--border-color);
  background-color: var(--surface-bg);
}

.icon-wrapper {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
}

.icon-wrapper.promo { background-color: var(--text-color); color: #fff; }
.icon-wrapper.delivery { background-color: var(--surface-elevated); color: var(--text-color); }
.icon-wrapper.stock { background-color: var(--surface-elevated); color: var(--text-color); }

.notification-content h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.notification-content p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 6px 0;
  line-height: 1.4;
}

.time-ago {
  font-size: 0.75rem;
  color: #b0b0b0;
}

.unread-dot {
  width: 7px;
  height: 7px;
  background-color: var(--text-color);
  border-radius: 50%;
  position: absolute;
  top: 22px;
  right: 18px;
}

/* =========================================
   MOBILE E DESKTOP (Responsividade)
   ========================================= */
@media (max-width: 768px) {
  .notifications-page {
    padding: 20px 18px;
  }

  .notifications-header {
    margin-bottom: 28px;
  }

  .back-btn {
    font-size: 24px;
  }
}

.notifications-page {
  background-color: var(--surface-bg);
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 24px;
}

@media (min-width: 1024px) {
  .notification-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.04);
  }
}
</style>
