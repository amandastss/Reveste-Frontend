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
const profileRole = computed(() => {
  if (user.value.role === 'seller') return 'Vendedor'
  if (user.value.role === 'buyer') return 'Comprador'
  return ''
})
const formattedBirthdate = computed(() => {
  if (!user.value.date_of_birth) return ''
  const date = new Date(user.value.date_of_birth)
  return isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR')
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
            :src="user.photo || user.avatar || user.image"
            alt="Foto de perfil"
          />
          <span v-else>{{ profileName.charAt(0) || 'U' }}</span>
        </div>
        <h2>{{ profileName }}</h2>
        <p v-if="profileEmail">{{ profileEmail }}</p>
        <p v-if="user.phone">Telefone: {{ user.phone }}</p>
        <p v-if="formattedBirthdate">Nascimento: {{ formattedBirthdate }}</p>
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
            <span>Excluir conta</span>
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