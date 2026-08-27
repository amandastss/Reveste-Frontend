<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  buscarNotificacoes,
  marcarNotificacaoComoLida,
  type Notificacao
} from '@/services/notificacoesApi'

const router = useRouter()

const notifications = ref<Notificacao[]>([])
const loading = ref(true)
const error = ref(false)

const unreadCount = computed(() => {
  return notifications.value.filter(
    notification => !notification.lida
  ).length
})

async function carregarNotificacoes() {
  loading.value = true
  error.value = false

  try {
    const resultado = await buscarNotificacoes()

    notifications.value = Array.isArray(resultado)
      ? resultado
      : []

    console.log(
      'Notificações carregadas:',
      notifications.value
    )

  } catch (err) {
    console.error(
      'Erro ao carregar notificações:',
      err
    )

    error.value = true
  } finally {
    loading.value = false
  }
}

async function handleNotificationClick(
  notification: Notificacao
) {
  if (notification.lida) {
    return
  }

  // muda imediatamente na tela
  notification.lida = true

  try {
    await marcarNotificacaoComoLida(
      notification.id
    )

  } catch (err) {
    console.error(
      'Erro ao marcar notificação como lida:',
      err
    )

    // desfaz caso dê erro
    notification.lida = false
  }
}

async function marcarTodasComoLidas() {
  const naoLidas = notifications.value.filter(
    notification => !notification.lida
  )

  for (const notification of naoLidas) {
    try {
      await marcarNotificacaoComoLida(
        notification.id
      )

      notification.lida = true

    } catch (err) {
      console.error(
        'Erro ao marcar notificação:',
        notification.id,
        err
      )
    }
  }
}

function goBack() {
  router.back()
}

onMounted(() => {
  carregarNotificacoes()
})
</script>

<template>
  <div class="notifications-page">

    <!-- HEADER -->
    <header class="notifications-header">

      <button
        @click="goBack"
        class="back-btn"
        aria-label="Voltar"
      >
        <span class="material-symbols-outlined">
          arrow_back
        </span>
      </button>

      <div class="header-title">

        <h1 class="page-title">
          Notificações
        </h1>

        <span
          v-if="unreadCount > 0"
          class="unread-count"
        >
          {{ unreadCount }}
          não lida{{ unreadCount > 1 ? 's' : '' }}
        </span>

      </div>

    </header>

    <!-- CARREGANDO -->
    <div
      v-if="loading"
      class="state-message"
    >
      <span class="material-symbols-outlined loading-icon">
        progress_activity
      </span>

      <p>
        Carregando notificações...
      </p>
    </div>

    <!-- ERRO -->
    <div
      v-else-if="error"
      class="state-message"
    >
      <span class="material-symbols-outlined">
        error_outline
      </span>

      <p>
        Não foi possível carregar as notificações.
      </p>

      <button
        class="retry-btn"
        @click="carregarNotificacoes"
      >
        Tentar novamente
      </button>
    </div>

    <!-- VAZIO -->
    <div
      v-else-if="notifications.length === 0"
      class="empty-state"
    >
      <span class="material-symbols-outlined empty-icon">
        notifications_none
      </span>

      <h2>
        Nenhuma notificação
      </h2>

      <p>
        Quando houver novidades sobre seus pedidos,
        ofertas ou sua conta, elas aparecerão aqui.
      </p>
    </div>

    <!-- LISTA -->
    <main
      v-else
      class="notifications-list"
    >

      <!-- MARCAR TODAS -->
      <div
        v-if="unreadCount > 0"
        class="mark-all-container"
      >
        <button
          class="mark-all-btn"
          @click="marcarTodasComoLidas"
        >
          Marcar todas como lidas
        </button>
      </div>

      <!-- NOTIFICAÇÃO -->
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'notification-card',
          {
            unread: !notification.lida
          }
        ]"
        @click="handleNotificationClick(notification)"
      >

        <!-- ÍCONE -->
        <div
          :class="[
            'icon-wrapper',
            {
              'unread-icon': !notification.lida
            }
          ]"
        >
          <span class="material-symbols-outlined">
            notifications
          </span>
        </div>

        <!-- CONTEÚDO -->
        <div class="notification-content">

          <h3>
            {{ notification.mensagem }}
          </h3>

          <span class="time-ago">
            {{
              new Date(
                notification.data_envio
              ).toLocaleString('pt-BR')
            }}
          </span>

        </div>

        <!-- BOLINHA -->
        <div
          v-if="!notification.lida"
          class="unread-dot"
        ></div>

      </div>

    </main>

  </div>
</template>

<style scoped>
.notifications-page {
  background-color: var(--surface-bg);
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  font-family: "Montserrat", sans-serif;
  box-sizing: border-box;
}

.notifications-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  min-height: 42px;
}

.back-btn {
  position: absolute;
  left: 0;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
}

.back-btn:hover {
  background: var(--surface-elevated);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title {
  font-size: 1.7rem;
  font-weight: 500;
  margin: 0;
  color: var(--text-color);
}

.unread-count {
  font-size: 11px;
  color: var(--text-muted);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mark-all-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
}

.mark-all-btn {
  border: none;
  background: transparent;
  color: var(--text-color);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}

.notification-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 18px;
  background-color: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  transition: 0.2s ease;
}

.notification-card.unread {
  background-color: var(--surface-elevated);
}

.icon-wrapper {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  background-color: var(--surface-elevated);
  color: var(--text-muted);
}

.icon-wrapper.unread-icon {
  background-color: var(--text-color);
  color: var(--surface-bg);
}

.notification-content {
  flex: 1;
  padding-right: 15px;
}

.notification-content h3 {
  font-size: 0.92rem;
  font-weight: 600;
  margin: 0 0 7px;
  color: var(--text-color);
  line-height: 1.4;
}

.time-ago {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.unread-dot {
  position: absolute;
  top: 20px;
  right: 18px;
  width: 7px;
  height: 7px;
  background-color: var(--text-color);
  border-radius: 50%;
}

.state-message,
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 50px 20px;
  color: var(--text-muted);
}

.state-message .material-symbols-outlined,
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.state-message p {
  margin: 0;
  font-size: 14px;
}

.empty-state h2 {
  color: var(--text-color);
  font-size: 18px;
  margin: 10px 0 6px;
}

.empty-state p {
  max-width: 330px;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.retry-btn {
  margin-top: 15px;
  border: none;
  background: var(--text-color);
  color: var(--surface-bg);
  border-radius: 20px;
  padding: 10px 18px;
  font-family: inherit;
  cursor: pointer;
}

@media (min-width: 1024px) {
  .notifications-page {
    padding: 30px 40px;
  }

  .notification-card:hover {
    transform: translateY(-2px);
  }
}

@media (max-width: 768px) {
  .notifications-page {
    padding: 20px 18px;
  }

  .page-title {
    font-size: 1.4rem;
  }

  .notification-card {
    padding: 15px;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>