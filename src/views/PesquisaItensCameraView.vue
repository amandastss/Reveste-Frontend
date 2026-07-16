<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const imagem = ref<string | null>(null)

interface Produto {
  id: number
  nome: string
  preco: number
  imagem_url?: string
  imagem?: string
}

const produtos = ref<Produto[]>([])
const API_BASE = import.meta.env.VITE_API_URL


async function buscarProdutos() {

  if (!imagem.value) return


  try {

    const blob = await fetch(imagem.value)
      .then(res => res.blob())


    const arquivo = new File(
      [blob],
      "imagem-pesquisa.webp",
      {
        type: blob.type
      }
    )


    const formData = new FormData()

    formData.append(
      "imagem",
      arquivo
    )


    const response = await axios.post(
      `${API_BASE}/api/pesquisa-imagem/`,
      formData,
      {
        headers:{
          "Content-Type":"multipart/form-data"
        }
      }
    )


    console.log(
      "Produtos recebidos:",
      response.data
    )


    produtos.value = response.data


  } catch(error){

    console.error(
      "Erro na busca por imagem:",
      error
    )

  }

}
onMounted(async () => {

  imagem.value = sessionStorage.getItem('camera-image')

  await buscarProdutos()

})

function voltar() {
  router.back()
}
</script>

<template>
  <div class="page">

    <div class="top-bar">
      <span class="material-symbols-outlined" @click="voltar">arrow_back</span>

      <h2>Resultado da busca</h2>
    </div>

    <div class="preview-card" v-if="imagem">
      <img :src="imagem" />
    </div>

    <div class="results-title">
      Produtos semelhantes
    </div>

    <div class="grid">

      <div
        v-for="item in produtos"
        :key="item.id"
        class="card"
      >
        <img :src="item.imagem" />

        <div class="info">
          <h3>{{ item.nome }}</h3>
          <p>R$ {{ item.preco }}</p>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--surface-elevated);
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--surface-bg);
  border-bottom: 1px solid #eee;
}

.top-bar span {
  cursor: pointer;
}

.top-bar h2 {
  font-size: 16px;
  margin: 0;
}

.preview-card {
  padding: 16px;
}

.preview-card img {
  width: 100%;
  max-width: 420px;
  display: block;
  margin: auto;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,.08);
}

.results-title {
  padding: 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 12px;
  padding: 16px;
}

.card {
  background: var(--surface-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
}

.card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.info {
  padding: 10px;
}

.info h3 {
  font-size: 14px;
  margin: 0;
}

.info p {
  margin-top: 4px;
  color: var(--text-muted);
}
</style>
