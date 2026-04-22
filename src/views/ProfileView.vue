<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const menuItems = [
  { label: 'Meus Pedidos', icon: 'inventory_2', route: '/pedidos' },
  { label: 'Promoções', icon: 'emoji_events', route: '/promocoes' },
  { label: 'Favoritos', icon: 'favorite', extra: '5 itens', route: '/favoritos' },
  { label: 'Seguindo', icon: 'star', route: '/seguindo' },
  { label: 'Aparência', icon: 'palette', route: '/aparencia' },
  { label: 'Ajuda e Suporte', icon: 'lock', route: '/suporte' },
];

function goTo(route: string) {
  router.push(route);
}

function logout() {
  console.log('Excluir conta');
}
</script>

<template>
  <div class="profile-page">

    <!-- HEADER -->
    <div class="profile-header">
      <div class="avatar"></div>
      <h2>Marina Sena</h2>
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
        <span class="material-symbols-outlined">logout</span>
        <span>Excluir conta</span>
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
}

/* MENU */
.menu {
  margin-top: 10px;
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