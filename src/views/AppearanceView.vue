<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const theme = ref<'light' | 'dark'>('light')

function applyTheme(value: 'light' | 'dark') {
  theme.value = value
  document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem('app-theme', value)
}

function setTheme(value: 'light' | 'dark') {
  applyTheme(value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme')

  if (savedTheme === 'light' || savedTheme === 'dark') {
    applyTheme(savedTheme)
    return
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(prefersDark ? 'dark' : 'light')
})
</script>

<template>
  <div class="appearance-page">
    <div class="appearance-card">
      <button class="back-button" type="button" @click="router.back()">
        <span class="material-symbols-outlined">arrow_back</span>
        <span>Voltar</span>
      </button>

      <div class="appearance-header">
        <p class="eyebrow">Aparência</p>
        <h1>Escolha o tema do app</h1>
        <p>Altere a cor de fundo e o contraste para uma experiência mais confortável.</p>
      </div>

      <div class="theme-options">
        <button class="theme-card" :class="{ active: theme === 'light' }" type="button" @click="setTheme('light')">
          <span class="chip chip-light">Claro</span>
          <div class="theme-preview light-preview">
            <div class="preview-top"></div>
            <div class="preview-body">
              <div class="preview-sidebar"></div>
              <div class="preview-content">
                <div class="preview-item"></div>
                <div class="preview-item small"></div>
              </div>
            </div>
          </div>
          <strong>Tema claro</strong>
        </button>

        <button class="theme-card" :class="{ active: theme === 'dark' }" type="button" @click="setTheme('dark')">
          <span class="chip chip-dark">Escuro</span>
          <div class="theme-preview dark-preview">
            <div class="preview-top"></div>
            <div class="preview-body">
              <div class="preview-sidebar"></div>
              <div class="preview-content">
                <div class="preview-item"></div>
                <div class="preview-item small"></div>
              </div>
            </div>
          </div>
          <strong>Tema escuro</strong>
        </button>
      </div>

      <div class="hint">
        <span class="material-symbols-outlined">auto_awesome</span>
        <p>Seu tema será salvo automaticamente e aplicado nas próximas visitas.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.appearance-page {
  padding: 24px 16px 80px;
  min-height: calc(100vh - 80px);
  background: var(--app-bg);
  color: var(--text-color);
}

.appearance-card {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 16px 36px var(--shadow-color);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
  font-size: 14px;
}

.appearance-header h1 {
  font-size: 24px;
  margin: 4px 0 8px;
}

.appearance-header p {
  color: var(--text-muted);
  margin: 0;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--accent);
  margin: 0;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.theme-card {
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 14px;
  background: var(--surface-elevated);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  text-align: left;
}

.theme-card.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.chip-light {
  background: #f3f4f6;
  color: #111827;
}

.chip-dark {
  background: #111827;
  color: #f9fafb;
}

.theme-preview {
  border-radius: 14px;
  padding: 10px;
  border: 1px solid var(--border-color);
}

.light-preview {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
}

.dark-preview {
  background: linear-gradient(135deg, #111827 0%, #0f172a 100%);
}

.preview-top {
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  margin-bottom: 10px;
}

.preview-body {
  display: grid;
  grid-template-columns: 28% 1fr;
  gap: 8px;
}

.preview-sidebar,
.preview-item {
  border-radius: 10px;
}

.preview-sidebar {
  background: rgba(255, 255, 255, 0.4);
  min-height: 70px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  height: 16px;
  background: rgba(255, 255, 255, 0.7);
}

.preview-item.small {
  width: 70%;
}

.theme-card strong {
  font-size: 15px;
}

.hint {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--accent-soft);
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
}

.hint p {
  margin: 0;
  color: var(--text-color);
}

@media (max-width: 640px) {
  .theme-options {
    grid-template-columns: 1fr;
  }
}
</style>
