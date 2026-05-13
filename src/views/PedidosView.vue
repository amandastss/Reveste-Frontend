<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const pedidos = ref([
  {
    id: '#111115',
    nome: 'Blusa regata alfaiataria',
    cor: 'bege',
    tamanho: 'M',
    preco: 85,
    status: 'entregue',
    imagem: 'https://via.placeholder.com/80',
  },
  {
    id: '#111114',
    nome: 'Jeans semi-novo',
    cor: 'claro',
    tamanho: 'M',
    preco: 110,
    status: 'cancelado',
    imagem: 'https://via.placeholder.com/80',
  },
  {
    id: '#111113',
    nome: 'Vestido mid',
    cor: 'bege',
    tamanho: 'M',
    preco: 88,
    status: 'a entregar',
    imagem: 'https://via.placeholder.com/80',
  },
]);

function abrirPedido(id: string) {
  router.push(`/pedido/${id}`);
}

function statusClass(status: string) {
  switch (status) {
    case 'entregue':
      return 'green';

    case 'cancelado':
      return 'gray';

    case 'a entregar':
      return 'blue';

    default:
      return 'red';
  }
}
</script>

<template>
  <div class="pedidos-page">

    <div class="header">
      <span
        class="material-symbols-outlined back"
        @click="$router.back()"
      >
        arrow_back
      </span>

      <h2>MEUS PEDIDOS</h2>
    </div>

    <div
      v-for="pedido in pedidos"
      :key="pedido.id"
      class="pedido-card"
      @click="abrirPedido(pedido.id)"
    >
      <img :src="pedido.imagem" />

      <div class="info">
        <span class="id">ID: {{ pedido.id }}</span>

        <h3>{{ pedido.nome }}</h3>

        <p>{{ pedido.cor }} | {{ pedido.tamanho }}</p>

        <strong>R$ {{ pedido.preco }}</strong>
      </div>

      <div :class="['status', statusClass(pedido.status)]">
        {{ pedido.status }}
      </div>
    </div>

  </div>
</template>

<style scoped>
.pedidos-page {
  background: #f5f5f5;
  min-height: 100vh;
  font-family: "Montserrat", sans-serif;
}

.header {
  background: white;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.back {
  cursor: pointer;
}

.pedido-card {
  background: white;
  display: flex;
  padding: 15px;
  gap: 15px;
  border-bottom: 1px solid #eee;
  position: relative;
  cursor: pointer;
}

.pedido-card img {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
}

.info {
  flex: 1;
}

.id {
  font-size: 12px;
  color: gray;
}

.info h3 {
  margin: 5px 0;
  font-size: 15px;
}

.info p {
  color: #666;
  font-size: 13px;
}

.info strong {
  color: #ff5a5a;
}

.status {
  position: absolute;
  right: 15px;
  top: 15px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 11px;
}

.green {
  background: #dff7e2;
  color: green;
}

.gray {
  background: #eee;
  color: gray;
}

.blue {
  background: #dbeeff;
  color: #007aff;
}

.red {
  background: #ffdede;
  color: red;
}
</style>
