<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import HeaderMobile from './components/HeaderMobileComponent.vue'
import HeaderDesktop from './components/HeaderDesktopComponent.vue'
import FooterMobile from './components/FooterMobileComponent.vue'
import MenuComponent from './components/MenuComponent.vue'
import { buscarNotificacoes, type Notificacao } from './services/notificacoesApi'
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

async function openNotification() {
  const target = resolveNotificationTarget(activeNotification.value)

  if (target) {
    await router.push(target)
  }

  activeNotification.value = null
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

      <button class="global-notification-action" @click.stop="openNotification">Abrir</button>
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
  position: sticky;
  top: 12px;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px auto 0;
  width: min(94vw, 540px);
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.95);
  color: var(--text-color);
  box-shadow: 0 18px 36px rgba(17, 17, 17, 0.08);
  backdrop-filter: blur(10px);
  cursor: pointer;
  font-family: 'Manrope', sans-serif;
}

.global-notification-banner.answer {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(255, 255, 255, 0.96));
  border-color: rgba(16, 185, 129, 0.2);
}

.global-notification-banner.question {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(255, 255, 255, 0.96));
  border-color: rgba(251, 191, 36, 0.25);
}

.global-notification-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(17, 17, 17, 0.06);
  color: var(--text-color);
}

.global-notification-banner.answer .global-notification-icon {
  background: rgba(16, 185, 129, 0.12);
  color: #0f766e;
}

.global-notification-banner.question .global-notification-icon {
  background: rgba(245, 158, 11, 0.12);
  color: #9a5b00;
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
  font-size: 0.72rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-color);
  opacity: 0.9;
  font-weight: 800;
}

.global-notification-copy span {
  font-size: 0.86rem;
  line-height: 1.4;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.global-notification-action {
  border: none;
  border-radius: 999px;
  background: var(--text-color);
  color: var(--surface-bg);
  font-weight: 700;
  font-size: 0.74rem;
  padding: 8px 12px;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(17, 17, 17, 0.12);
  font-family: 'Manrope', sans-serif;
}

.global-notification-banner.answer .global-notification-action {
  background: #0f766e;
}

.global-notification-banner.question .global-notification-action {
  background: #a16207;
}
</style>
