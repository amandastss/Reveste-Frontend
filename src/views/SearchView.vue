<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const search = ref('')

const categorias = [
  { nome: 'Feminino' },
  { nome: 'Masculino' },
  { nome: 'Infantil' },
]

const recentes = ref([
  'Jeans',
  'Sapatos',
  'Cropped',
  'Jaqueta'
])

function remover(item: string) {
  recentes.value = recentes.value.filter(i => i !== item)
}

function voltar() {
  router.back()
}
</script>

<template>
  <div class="search-page">

    <!-- HEADER -->
    <div class="search-header">
      <span class="material-symbols-outlined back" @click="voltar">
        arrow_back
      </span>

      <input
        v-model="search"
        placeholder="Search..."
        class="search-input"
      />

      <span class="material-symbols-outlined camera">
        photo_camera
      </span>
    </div>

    <!-- CATEGORIAS -->
    <div class="categorias">
      <div v-for="cat in categorias" :key="cat.nome" class="categoria">
        <div class="icon-circle">
          <span class="material-symbols-outlined">person</span>
        </div>
        <span class="label">{{ cat.nome }}</span>
      </div>
    </div>

    <!-- RECENTES -->
    <div class="recentes">
      <h3>Pesquisas recentes</h3>

      <div
        v-for="item in recentes"
        :key="item"
        class="recente-item"
      >
        <span>{{ item }}</span>
        <span
          class="material-symbols-outlined close"
          @click="remover(item)"
        >
          close
        </span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.search-page {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
  background: #f6f6f6;
  min-height: 100vh;
}

/* HEADER */
.search-header {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #eaeaea;
  padding: 10px 14px;
  border-radius: 14px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
}

.back,
.camera {
  font-size: 22px;
  color: #555;
  cursor: pointer;
}

/* CATEGORIAS */
.categorias {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.categoria {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #eaeaea;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label {
  font-size: 12px;
}

/* RECENTES */
.recentes {
  margin-top: 28px;
}

.recentes h3 {
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: 600;
}

.recente-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
}

.close {
  font-size: 18px;
  color: #888;
  cursor: pointer;
}
</style>
