<script setup lang="ts">
import { ref } from 'vue';

const search = ref('');

const categorias = [
  { nome: 'Feminino' },
  { nome: 'Masculino' },
  { nome: 'Infantil' },
];

const recentes = ref([
  'Jeans',
  'sapatos',
  'Cropped',
  'Jaqueta'
]);

function remover(item: string) {
  recentes.value = recentes.value.filter(i => i !== item);
}
</script>

<template>
  <div class="search-page">

    <div class="search-header">
      <span class="material-symbols-outlined back">arrow_back</span>

      <input
        v-model="search"
        placeholder="Search..."
        class="search-input"
      />

      <span class="material-symbols-outlined camera">photo_camera</span>
    </div>

    <div class="categorias">
      <div v-for="cat in categorias" :key="cat.nome" class="categoria">
        <div class="icon-circle">
          <span class="material-symbols-outlined">person</span>
        </div>
        <span class="label">{{ cat.nome }}</span>
      </div>
    </div>

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
  padding: 12px;
  background: white;
  min-height: 100vh;
}


.search-header {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #eaeaea;
  padding: 8px 12px;
  border-radius: 12px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
}

.back, .camera {
  font-size: 22px;
  color: #555;
}


.categorias {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.categoria {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #eaeaea;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label {
  font-size: 12px;
}


.recentes {
  margin-top: 25px;
}

.recentes h3 {
  font-size: 14px;
  margin-bottom: 10px;
}

.recente-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.close {
  font-size: 18px;
  color: #888;
  cursor: pointer;
}
</style>