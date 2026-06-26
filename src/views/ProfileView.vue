<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
})

const profileName = computed(
  () =>
    user.value.name ||
    user.value.username ||
    user.value.first_name ||
    user.value.full_name ||
    'Usuário'
)
const profileEmail = computed(() => user.value.email || '')

const formattedBirthdate = computed(() => {
  if (!user.value.birth_date
) return ''
  const date = new Date(user.value.birth_date
)
  return isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR')
})
const formattedImageUrl = computed(() => {
  if (!user.value.photo && !user.value.avatar && !user.value.image) {
    return 'https://via.placeholder.com/150?text=Sem+imagem'
  }
  const imageUrl =
    user.value.photo || user.value.avatar || user.value.image || ''
  return imageUrl.startsWith('http')
    ? imageUrl
    : `${import.meta.env.VITE_API_URL}/api${imageUrl}`
})

const menuItems = [
  { label: 'Meus Pedidos', icon: 'inventory_2', route: '/pedidos' },
  { label: 'Promoções', icon: 'emoji_events', route: '/promocoes' },
  { label: 'Favoritos', icon: 'favorite', extra: '5 itens', route: '/favoritos' },
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

      <!-- HEADER -->
      <div class="profile-header">
        <div class="avatar">
          <img
            v-if="user.photo || user.avatar || user.image"
            :src="formattedImageUrl"
            alt="Foto de perfil"
          />
          <span v-else>{{ profileName.charAt(0) || 'U' }}</span>
        </div>
        <h2>{{ profileName }}</h2>
      </div>

      <div class="account-card">
        <h3>Minha conta</h3>
        <div class="account-row">
          <span>Email</span>
          <strong>{{ profileEmail }}</strong>
        </div>
        <div class="account-row" v-if="user.phone">
          <span>Telefone</span>
          <strong>{{ user.phone }}</strong>
        </div>
        <div class="account-row" v-if="formattedBirthdate">
          <span>Data de nascimento</span>
          <strong>{{ formattedBirthdate }}</strong>
        </div>
      </div>

      <!-- MENU -->
      <div class="menu">

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

        <!-- DELETE -->
        <div class="menu-item delete" @click="logout">
          <div class="left">
            <span class="material-symbols-outlined">logout</span>
            <span>Sair</span>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.profile-page {
  background: #f5f5f5;
  min-height: 100vh;
  font-family: "Montserrat", sans-serif;
  color: black;

  display: flex;
  justify-content: center;
}

/* CONTAINER CENTRAL */
.profile-container {
  width: 100%;
  max-width: 900px;
}

/* HEADER */
.profile-header {
  background: black;
  color: white;
  padding: 40px 30px 20px;
  text-align: center;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.account-card {
  background: white;
  border-radius: 18px;
  padding: 20px;
  margin: 16px 0;
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.05);
}

.account-card h3 {
  margin: 0 0 14px;
  font-size: 18px;
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
  color: #666;
}

.account-row strong {
  color: #111;
}

.avatar {
  width: 80px;
  height: 80px;
  background: #ccc;
  border-radius: 50%;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #333;
  font-size: 28px;
  font-weight: 700;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  .menu {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 10px;
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
  background: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f9f9f9;
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
  color: gray;
}

.arrow {
  font-size: 18px;
  color: #999;
}

/* DELETE */
.delete {
  color: red;
  font-weight: 500;
}

/* ÍCONES */
.material-symbols-outlined {
  font-size: 22px;
}
</style>
