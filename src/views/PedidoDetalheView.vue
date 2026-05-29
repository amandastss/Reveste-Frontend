<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const pedido = {
  id: route.params.id,
  nome: 'Blusa bege',
  preco: 85,
  status: 'ENTREGUE',
  imagem: 'https://via.placeholder.com/100',
  endereco: 'Joinville, Santa Catarina',
  timeline: [
    {
      titulo: 'O seu pacote foi entregue!',
      data: 'Dec 10 - 10:30',
      ativo: true,
    },
    {
      titulo: 'Saiu para entrega',
      data: 'Dec 10 - 8:37',
    },
    {
      titulo: 'Chegou na transportadora',
      data: 'Dec 10 - 6:30',
    },
  ],
};
</script>

<template>
  <div class="detalhe-page">

    <div class="top">
      <span
        class="material-symbols-outlined"
        @click="$router.back()"
      >
        arrow_back
      </span>

      <h2>MEU PEDIDO</h2>
    </div>

    <div class="status-card">
      <h3>{{ pedido.status }}</h3>

      <div class="infos">
        <p><strong>ID:</strong> {{ pedido.id }}</p>
        <p><strong>Endereço:</strong> {{ pedido.endereco }}</p>
      </div>
    </div>

    <div class="timeline">

      <div
        v-for="item in pedido.timeline"
        :key="item.titulo"
        class="timeline-item"
      >
        <div class="dot"></div>

        <div>
          <strong>{{ item.titulo }}</strong>
          <p>{{ item.data }}</p>
        </div>
      </div>

    </div>

    <div class="produto">
      <img :src="pedido.imagem" />

      <div>
        <h4>{{ pedido.nome }}</h4>
        <strong>R$ {{ pedido.preco }}</strong>
      </div>
    </div>

  </div>
</template>

<style scoped>
.detalhe-page {
  background: #f5f5f5;
  min-height: 100vh;
  font-family: "Montserrat", sans-serif;
}

.top {
  background: white;
  padding: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.status-card {
  background: black;
  color: white;
  margin: 20px;
  padding: 20px;
  border-radius: 20px;
}

.timeline {
  padding: 20px;
}

.timeline-item {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.dot {
  width: 12px;
  height: 12px;
  background: green;
  border-radius: 50%;
  margin-top: 5px;
}

.produto {
  background: white;
  margin: 20px;
  padding: 15px;
  display: flex;
  gap: 15px;
  border-radius: 20px;
}

.produto img {
  width: 80px;
  border-radius: 10px;
}
</style>
