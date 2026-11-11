<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import HeaderMobile from './components/HeaderMobileComponent.vue'
import HeaderDesktop from './components/HeaderDesktopComponent.vue'
import FooterMobile from './components/FooterMobileComponent.vue'
import MenuComponent from './components/MenuComponent.vue'
import {
  buscarNotificacoes,
  marcarNotificacaoComoLida,
  type Notificacao,
} from './services/notificacoesApi'
import { getNotificationMeta } from './utils/notificationMeta'

const route = useRoute()
const router = useRouter()

/* controla abrir e fechar o menu lateral */
const isMenuOpen = ref(false)
const activeNotification = ref<Notificacao | null>(null)
const lastNotifiedNotificationId = ref<number | string | null>(null)
let hideNotificationTimer: number | undefined
let notificationPoller: number | undefined

/* verifica se deve esconder o footer */
const shouldHideFooter = () => {
  return route.path.startsWith('/auth/')
}

function openMenu() {
  isMenuOpen.value = true
}

function closeMenu() {
  isMenuOpen.value = false
}

function resolveNotificationTarget(notification: Notificacao | null): string | null {
  if (!notification) return null

  const produtoId = notification.produto_id ?? null
  const perguntaId = notification.pergunta_id ?? null

  if (produtoId) {
    const query = perguntaId ? `?pergunta_id=${encodeURIComponent(String(perguntaId))}` : ''
    return `/produto/${produtoId}/perguntas${query}`
  }

  if (notification.link) {
    const link = notification.link.trim()
    if (link.startsWith('http://') || link.startsWith('https://')) {
      try {
        const url = new URL(link)
        return url.pathname + url.search
      } catch {
        return link.startsWith('/') ? link : `/${link}`
      }
    }

    return link.startsWith('/') ? link : `/${link}`
  }

  if (notification.route) {
    const routePath = notification.route.trim()
    return routePath.startsWith('/') ? routePath : `/${routePath}`
  }

  return null
}

function triggerDesktopNotification(notification: Notificacao) {
  if (!('Notification' in window)) return

  const permission = Notification.permission
  const meta = getNotificationMeta(notification)

  if (permission === 'granted') {
    try {
      new Notification(meta.title, {
        body: notification.mensagem,
        tag: `reveste-notification-${notification.id}`,
      })
    } catch {
      // ignora falhas do navegador
    }
    return
  }

  if (permission === 'default') {
    Notification.requestPermission().then((result) => {
      if (result === 'granted') {
        try {
          new Notification(meta.title, {
            body: notification.mensagem,
            tag: `reveste-notification-${notification.id}`,
          })
        } catch {
          // ignora falhas do navegador
        }
      }
    }).catch(() => {
      // ignora falhas do navegador
    })
  }
}

async function syncUnreadNotification() {
  try {
    const notifications = await buscarNotificacoes()
    const unread = Array.isArray(notifications) ? notifications.filter((item) => !item.lida) : []
    const next = unread[0] ?? null

    if (!next) {
      activeNotification.value = null
      lastNotifiedNotificationId.value = null
      return
    }

    if (String(next.id) !== String(lastNotifiedNotificationId.value)) {
      activeNotification.value = next
      triggerDesktopNotification(next)
      lastNotifiedNotificationId.value = next.id

      if (hideNotificationTimer) {
        window.clearTimeout(hideNotificationTimer)
      }

      hideNotificationTimer = window.setTimeout(() => {
        activeNotification.value = null
      }, 9000)
    }
  } catch {
    activeNotification.value = null
  }
}

async function clearActiveNotification() {
  const notification = activeNotification.value

  if (notification && !notification.lida && notification.id) {
    try {
      await marcarNotificacaoComoLida(notification.id)
      notification.lida = true
    } catch {
      // ignora falhas ao fechar a barra
    }
  }

  activeNotification.value = null

  if (hideNotificationTimer) {
    window.clearTimeout(hideNotificationTimer)
  }
}

async function openNotification() {
  const target = resolveNotificationTarget(activeNotification.value)

  if (target) {
    await router.push(target)
  }

  await clearActiveNotification()
}

onMounted(() => {
  void syncUnreadNotification()
  notificationPoller = window.setInterval(() => {
    void syncUnreadNotification()
  }, 20000)
})

onBeforeUnmount(() => {
  if (notificationPoller) {
    window.clearInterval(notificationPoller)
  }

  if (hideNotificationTimer) {
    window.clearTimeout(hideNotificationTimer)
  }
})
</script>

<template>
  <div class="app-container">
    <HeaderMobile @open-menu="openMenu" />

    <HeaderDesktop />

    <MenuComponent
      :isOpen="isMenuOpen"
      @close-menu="closeMenu"
    />

    <div
      v-if="activeNotification"
      :class="['global-notification-banner', getNotificationMeta(activeNotification).kind]"
      @click="openNotification"
      role="status"
      aria-live="polite"
    >
      <div class="global-notification-icon">
        <span class="material-symbols-outlined">{{ getNotificationMeta(activeNotification).icon }}</span>
      </div>

      <div class="global-notification-copy">
        <strong>{{ getNotificationMeta(activeNotification).title }}</strong>
        <span>{{ activeNotification.mensagem }}</span>
      </div>

      <div class="global-notification-actions">
        <button class="global-notification-action" @click.stop="openNotification">Abrir</button>
        <button class="global-notification-close" @click.stop="clearActiveNotification" aria-label="Fechar notificação">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>

    <main class="content">
      <router-view />
    </main>

    <FooterMobile v-if="!shouldHideFooter()" />
  </div>
</template>

<style>
/* esconder header mobile no desktop */
@media (min-width: 768px) {
  :deep(.header-mobile) {
    display: none;
  }
}

/* esconder header desktop no mobile */
@media (max-width: 767px) {
  :deep(.header-desktop) {
    display: none;
  }
}

/* esconder footer mobile no desktop */
@media (min-width: 768px) {
  :deep(.app-footer) {
    display: none;
  }
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--app-bg);
  color: var(--text-color);
}

.content {
  flex: 1;
  background: var(--app-bg);
}

.content > * {
  width: 100%;
}

button,
input,
select,
textarea {
  font-family: 'Manrope', sans-serif;
}

.global-notification-banner {
  position: fixed;
  top: max(16px, env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  width: min(calc(100vw - 32px), 540px);
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(168, 85, 247, 0.32);
  border-left: 3px solid #a855f7;
  background: #111111;
  color: #ffffff;
  box-shadow: 0 14px 35px var(--shadow-color), 0 0 20px rgba(168, 85, 247, 0.2);
  cursor: pointer;
  font-family: inherit;
  animation: notification-toast-enter 0.22s ease-out;
}

.global-notification-banner.answer {
  border-left-color: #a855f7;
}

.global-notification-banner:hover {
  box-shadow: 0 18px 40px var(--shadow-color), 0 0 26px rgba(168, 85, 247, 0.32);
}

.global-notification-banner:focus-visible,
.global-notification-action:focus-visible,
.global-notification-close:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.global-notification-icon {
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: #292929;
  color: #a855f7;
}

.global-notification-banner.answer .global-notification-icon {
  color: #a855f7;
}

.global-notification-banner.question .global-notification-icon {
  color: #a855f7;
}

.global-notification-icon .material-symbols-outlined {
  font-size: 20px;
}

.global-notification-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.global-notification-copy strong {
  font-size: 0.84rem;
  letter-spacing: -0.01em;
  color: #ffffff;
  font-weight: 700;
}

.global-notification-copy span {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #d1d5db;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.global-notification-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.global-notification-action,
.global-notification-close {
  border: none;
  border-radius: var(--radius-pill);
  font-weight: 700;
  font-size: 0.74rem;
  cursor: pointer;
  font-family: inherit;
}

.global-notification-action {
  background: #a855f7;
  color: #ffffff;
  padding: 8px 12px;
}

.global-notification-close {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #292929;
  color: #ffffff;
}

@keyframes notification-toast-enter {
  from {
    opacity: 0;
    transform: translate(-50%, -8px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .global-notification-banner {
    animation: none;
  }
}
</style>
