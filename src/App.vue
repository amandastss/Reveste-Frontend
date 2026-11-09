<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import HeaderMobile from './components/HeaderMobileComponent.vue'
import HeaderDesktop from './components/HeaderDesktopComponent.vue'
import FooterMobile from './components/FooterMobileComponent.vue'
import MenuComponent from './components/MenuComponent.vue'
import { buscarNotificacoes, type Notificacao } from './services/notificacoesApi'

const route = useRoute()
const router = useRouter()

/* controla abrir e fechar o menu lateral */
const isMenuOpen = ref(false)
const activeNotification = ref<Notificacao | null>(null)
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

async function syncUnreadNotification() {
  try {
    const notifications = await buscarNotificacoes()
    const unread = Array.isArray(notifications) ? notifications.filter((item) => !item.lida) : []
    const next = unread[0] ?? null

    if (!next) {
      activeNotification.value = null
      return
    }

    activeNotification.value = next

    if (hideNotificationTimer) {
      window.clearTimeout(hideNotificationTimer)
    }

    hideNotificationTimer = window.setTimeout(() => {
      activeNotification.value = null
    }, 9000)
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
      class="global-notification-banner"
      @click="openNotification"
      role="status"
      aria-live="polite"
    >
      <div class="global-notification-icon">
        <span class="material-symbols-outlined">notifications</span>
      </div>

      <div class="global-notification-copy">
        <strong>Nova pergunta</strong>
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
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px auto 0;
  width: min(94vw, 520px);
  padding: 12px 14px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(31, 41, 55, 0.96));
  color: white;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.26);
  cursor: pointer;
}

.global-notification-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
}

.global-notification-icon .material-symbols-outlined {
  font-size: 20px;
}

.global-notification-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.global-notification-copy strong {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.9;
}

.global-notification-copy span {
  font-size: 0.82rem;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.global-notification-action {
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: #111827;
  font-weight: 700;
  font-size: 0.76rem;
  padding: 8px 12px;
  cursor: pointer;
}
</style>
