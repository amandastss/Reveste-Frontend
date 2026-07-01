<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

type StoredUser = Record<string, unknown>

const getStoredUser = (): StoredUser => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

const user = computed(() => getStoredUser())

const profileName = computed(() => {
  const possibleFields = ['name', 'username', 'first_name', 'full_name'] as const
  const foundName = possibleFields
    .map((field) => {
      const value = user.value[field]
      return typeof value === 'string' ? value : ''
    })
    .find((value) => value)

  return foundName || 'Usuário'
})

const formattedImageUrl = computed(() => {
  const imageCandidates = ['photo', 'profile_image', 'avatar', 'image'] as const
  const imageUrl = imageCandidates
    .map((field) => {
      const value = user.value[field]
      return typeof value === 'string' ? value : ''
    })
    .find((value) => value)

  if (!imageUrl) {
    return 'https://via.placeholder.com/150?text=Sem+imagem'
  }

  return imageUrl.startsWith('http')
    ? imageUrl
    : `${import.meta.env.VITE_API_URL}/api${imageUrl}`
})

const menuItems = [
  { label: 'Meus Pedidos', icon: 'inventory_2', route: '/pedidos' },
  { label: 'Promoções', icon: 'emoji_events', route: '/notificacoes' },
  { label: 'Favoritos', icon: 'favorite', extra: '5 itens', route: '/search' },
  { label: 'Seguindo', icon: 'star', route: '/seguindo' },
  { label: 'Aparência', icon: 'palette', route: '/aparencia' },
  { label: 'Ajuda e Suporte', icon: 'lock', route: '/suporte' }
]

function goTo(route: string) {
  router.push(route)
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('email')
  localStorage.removeItem('isLogin')
  router.push('/auth/email')
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-container">

      <div class="profile-header">
        <button class="header-edit-button" @click="goTo('/profile/edit')" aria-label="Editar perfil">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <div class="avatar">
          <img
            v-if="user.photo || user.profile_image || user.avatar || user.image"
            :src="formattedImageUrl"
            alt="Foto de perfil"
          />
          <span v-else>{{ profileName.charAt(0) || 'U' }}</span>
        </div>
        <h2>{{ profileName }}</h2>
        <p v-if="user.bio" class="profile-bio">{{ user.bio }}</p>
      </div>

      <div class="profile-content">

        <div class="menu" v-if="menuItems.length">
          <div
            v-for="(item, index) in menuItems"
            :key="index"
            class="menu-item"
            @click="goTo(item.route)"
          >
            <div class="left">
              <span class="material-symbols-outlined">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </div>
            <div class="right">
              <span v-if="item.extra" class="extra">{{ item.extra }}</span>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>
          </div>
        </div>

        <div class="menu-item delete" @click="logout">
          <div class="left">
            <span class="material-symbols-outlined">logout</span>
            <span>Sair da conta</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.profile-page {
  background: var(--app-bg);
  min-height: 100vh;
  font-family: "Montserrat", sans-serif;
  color: var(--text-color);

  display: flex;
  justify-content: center;
}

/* CONTAINER CENTRAL */
.profile-container {
  width: 100%;
}

/* HEADER */
.profile-header {
  background: var(--header-bg);
  color: var(--header-text);
  padding: 40px 30px 20px;
  text-align: center;
  position: relative;
}

.header-edit-button {
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
}

/* CONTEÚDO (Minha Conta e Menu) */
.profile-content {
  padding: 0 20px 40px;
  width: 100%;
}

.account-card {
  background: var(--surface-bg);
  border-radius: 18px;
  padding: 20px;
  margin: 16px 0;
  box-shadow: 0 14px 35px var(--shadow-color);
}

.account-card h3 {
  margin: 0;
  font-size: 18px;
}

.account-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.account-hint {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.edit-profile-button {
  border: none;
  background: var(--surface-elevated);
  color: var(--text-color);
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
}

.account-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
}

.account-row:first-of-type {
  border-top: none;
}

.account-row span {
  color: var(--text-muted);
}

.account-row strong {
  color: var(--text-color);
}

.avatar {
  width: 80px;
  height: 80px;
  background: var(--surface-elevated);
  border-radius: 50%;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--text-color);
  font-size: 28px;
  font-weight: 700;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-bio {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 14px;
  text-align: center;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
  white-space: normal;
  line-height: 1.4;
}

/* MENU */
.menu {
  margin-top: 10px;
}
.profile-container {
  width: 100%;
  max-width: 900px;
  padding-bottom: 100px;
}
/* GRID NO DESKTOP */
@media (min-width: 768px) {
  .profile-content {

    padding: 0 40px 40px;
  }

  .menu {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    padding: 10px 0;
  }

  .menu-item {
    border-radius: 12px;
    border: none;
  }

  .delete {
    grid-column: span 2;
  }
}

.menu-item {
  background: var(--surface-bg);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.menu-item:hover {
  background: var(--surface-elevated);
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.extra {
  font-size: 12px;
  color: var(--text-muted);
}

.arrow {
  font-size: 18px;
  color: #999;
}

/* DELETE (Sair) */
.delete {
  color: red;
  font-weight: 500;
}

/* ÍCONES */
.material-symbols-outlined {
  font-size: 22px;
}
</style>
