<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const activeIndex = ref<number | null>(null)

interface FooterItem {
  aria: string
  icon: string
  route: string
}

const items: FooterItem[] = [
  { aria: 'Home', icon: 'home', route: '/' },
  { aria: 'Vender', icon: 'add', route: '/sell' },
  { aria: 'Perfil', icon: 'person', route: '/profile' },
]

function handleClick(item: FooterItem, index: number) {
  activeIndex.value = index
  router.push(item.route)
}
</script>

<template>
  <footer class="app-footer">
    <div class="footer-nav">
      <button
        v-for="(item, index) in items"
        :key="index"
        class="footer-button"
        :class="{ selected: activeIndex === index }"
        :aria-label="item.aria"
        @click="handleClick(item, index)"
      >
        <span class="material-symbols-outlined">
          {{ item.icon }}
        </span>
      </button>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  position:fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--surface-bg);
  border-top: 1px solid var(--border-color);
  padding: 12px;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.05);
}

/* NAV */
.footer-nav {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

/* BOTÃO BASE */
.footer-button {
  background: transparent;
  border: none;
  padding: 10px;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  transition: all 0.2s ease;
}

.footer-button:active {
  transform: scale(0.92);
  background: rgba(15, 23, 42, 0.06);
}

.footer-button.selected {
  background: var(--surface-elevated);
}

/* ÍCONE */
.material-symbols-outlined {
  font-size: 22px;
  color: var(--text-color);
  transition: color 0.2s ease;
}

/* BOTÃO DO MEIO (VENDER) */
.footer-button:nth-child(2) {
  background: black;
}

.footer-button:nth-child(2) .material-symbols-outlined {
  color: var(--surface-bg);
}

.footer-button:nth-child(2):active {
  transform: scale(0.95);
  opacity: 0.9;
}

/* esconder no desktop */
@media (min-width: 768px) {
  .app-footer {
    display: none;
  }
}
</style>
