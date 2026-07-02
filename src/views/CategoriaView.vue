<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

interface Categoria {
  id: number
  nome: string
  name?: string
  title?: string
  imagem_url?: string | null
}

interface Produto {
  id: number
  nome: string
  name?: string
  preco: number
  imagem_url?: string | null
  imagem?: string
  categoria?: string | number | { id?: number }
  categoria_id?: number | string
  categoria_nome?: string
  categoriaNome?: string
  categoria_name?: string
  category?: string | number | { id?: number }
  category_id?: number | string
}

const route = useRoute()
const router = useRouter()

const categoria = ref<Categoria | null>(null)
const produtos = ref<Produto[]>([])
const carregando = ref(true)

const formatMediaUrl = (url?: string | null) => {
  if (!url) return '/default.png'
  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`
}

const normalizar = (valor?: string | null) => {
  if (!valor) return ''
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const getCategoriaNome = (item: Categoria | null) => {
  if (!item) return ''
  return item.nome || item.name || item.title || ''
}

const produtoPertenceCategoria = (produto: Produto, categoriaSelecionada: Categoria | null) => {
  if (!categoriaSelecionada) return false

  const idCategoria = Number(categoriaSelecionada.id)
  const candidatos = [
    produto.categoria_id,
    produto.category_id,
    typeof produto.categoria === 'object' && produto.categoria
      ? produto.categoria.id
      : produto.categoria,
    typeof produto.category === 'object' && produto.category
      ? produto.category.id
      : produto.category,
    produto.categoria_nome,
    produto.categoriaNome,
    produto.categoria_name,
    typeof produto.categoria === 'string' ? produto.categoria : undefined,
    typeof produto.category === 'string' ? produto.category : undefined,
  ]

  if (candidatos.some((valor) => Number(valor) === idCategoria && Number.isFinite(Number(valor)))) {
    return true
  }

  const nomeCategoria = normalizar(getCategoriaNome(categoriaSelecionada))
  const nomeProduto = normalizar(
    [
      typeof produto.categoria === 'string' ? produto.categoria : '',
      typeof produto.category === 'string' ? produto.category : '',
      produto.categoria_nome || '',
      produto.categoriaNome || '',
      produto.categoria_name || '',
      produto.nome || '',
      produto.name || '',
    ].join(' '),
  )

  if (!nomeCategoria) return false
  return nomeProduto.includes(nomeCategoria)
}

const carregarCategoria = async () => {
  carregando.value = true

  try {
    const [resCategorias, resProdutos] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/api/categorias/`),
      axios.get(`${import.meta.env.VITE_API_URL}/api/produtos/`),
    ])

    const categoriasApi = Array.isArray(resCategorias.data?.results)
      ? resCategorias.data.results
      : Array.isArray(resCategorias.data)
        ? resCategorias.data
        : []

    const produtosApi = Array.isArray(resProdutos.data?.results)
      ? resProdutos.data.results
      : Array.isArray(resProdutos.data)
        ? resProdutos.data
        : []

    const categoriaId = Number(route.params.id)
    categoria.value =
      categoriasApi.find((item: Categoria) => Number(item.id) === categoriaId) || null

    produtos.value = produtosApi.filter((produto: Produto) =>
      produtoPertenceCategoria(produto, categoria.value),
    )
  } catch (error) {
    console.error('Erro ao carregar categoria:', error)
    produtos.value = []
  } finally {
    carregando.value = false
  }
}

const voltar = () => router.back()

const abrirProduto = (id: number) => {
  router.push({ name: 'produto-detalhe', params: { id } })
}

const tituloCategoria = computed(() => getCategoriaNome(categoria.value))

onMounted(() => {
  carregarCategoria()
})
</script>

<template>
  <div class="categoria-page">
    <div class="header">
      <button class="back" @click="voltar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h2>{{ tituloCategoria || 'Categoria' }}</h2>
    </div>

    <p v-if="carregando" class="status">Carregando produtos...</p>

    <div v-else-if="!produtos.length" class="empty">
      <p>Nenhum produto encontrado para esta categoria.</p>
    </div>

    <div v-else class="products">
      <div
        v-for="produto in produtos"
        :key="produto.id"
        class="card"
        @click="abrirProduto(produto.id)"
      >
        <img
          :src="formatMediaUrl(produto.imagem_url || produto.imagem)"
          :alt="produto.nome || produto.name"
        />
        <div class="info">
          <h3>{{ produto.nome || produto.name }}</h3>
          <p class="price">R$ {{ Number(produto.preco).toFixed(2) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.categoria-page {
  max-width: 430px;
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
}

/* HEADER */
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.back {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.back:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.back:active {
  transform: scale(0.95);
}

.back svg {
  width: 24px;
  height: 24px;
  color: #333;
  transition: all 0.3s ease;
}

.back:hover svg {
  transform: translateX(-2px);
}

.header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  max-width: calc(100% - 54px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ESTADOS */
.status,
.empty {
  text-align: center;
  font-size: 13px;
  color: #888;
  padding: 40px 20px;
}

/* GRID */
.products {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px 20px;
}

/* CARD */
.card {
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
}

.card:active {
  transform: scale(0.97);
}

/* IMAGE */
.card img {
  width: 100%;
  height: 170px;
  object-fit: cover;
  background: #f8f8f8;
}

/* INFO */
.info {
  padding: 10px;
}

.info h3 {
  font-size: 12px;
  font-weight: 500;
  margin: 0 0 4px;
  color: #333;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price {
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  color: #000;
}

/* RESPONSIVO */
@media (max-width: 380px) {
  .products {
    gap: 10px;
  }

  .card img {
    height: 150px;
  }
}
</style>
