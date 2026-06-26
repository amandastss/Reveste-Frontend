<script setup lang="ts">
import blusa from '@/assets/roupas/blusalaranjabasica.png'
import jeans from '@/assets/roupas/calcajeansskinny.png'
import skinny from '@/assets/roupas/calcaskinny.png'
import { ref, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import axios from 'axios'

const router = useRouter()
const route = useRoute()

interface Produto {
  id: number
  nome: string
  preco: number
  marca: string
  categoria: string
  genero: string
  imagem: string
  categoria_nome?: string
  categoriaNome?: string
  categoria_name?: string
  tipo?: string
}

const search = ref("")
const categoria = ref("")
const categoriaFiltro = ref("")
const produtos = ref<Produto[]>([])
const recentes = ref<string[]>([])

const RECENTES_KEY = 'recent_searches_v1'
const LEGACY_KEYS = ['recent_searches', 'recentSearches', 'recent_searches_v1']
const DEFAULT_RECENTES = ["Calças", "Blusas", "Sapatos", "Jaqueta"]

const parseRecentes = (raw: string | null): string[] | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed
    }
  } catch (e) { void e }
  return null
}

const carregarRecentes = () => {
  for (const key of LEGACY_KEYS) {
    const raw = localStorage.getItem(key)
    const parsed = parseRecentes(raw)
    if (parsed) {
      recentes.value = parsed
      if (key !== RECENTES_KEY) {
        salvarRecentesNoStorage()
      }
      return
    }
  }

  recentes.value = DEFAULT_RECENTES
}

const salvarRecentesNoStorage = () => {
  try {
    localStorage.setItem(RECENTES_KEY, JSON.stringify(recentes.value.slice(0, 20)))
  } catch (e) { void e }
}

const mock: Produto[] = [
  {
    id: 1,
    nome: "Blusa Laranja Básica",
    preco: 50,
    marca: "Nike",
    categoria: "camiseta",
    genero: "feminino",
    imagem: blusa
  },
  {
    id: 2,
    nome: "Calça Jeans Skinny",
    preco: 90,
    marca: "Zara",
    categoria: "calca",
    genero: "feminino",
    imagem: jeans
  },
  {
    id: 3,
    nome: "Calça Skinny",
    preco: 70,
    marca: "Shein",
    categoria: "calca",
    genero: "feminino",
    imagem: skinny
  }
]

const fetchProdutos = async (q?: string) => {
  try {
    const params = q ? { search: q } : {}

    const res = await axios.get('/api/produtos/', {
      params
    })

    produtos.value = Array.isArray(res.data)
      ? res.data
      : (res.data.results || [])

    console.log('Produtos carregados:', produtos.value)
  } catch (error) {
    console.warn('API indisponível. Usando mock.', error)
    produtos.value = mock
  }
}

const aplicarCategoriaDaRota = () => {
  const valorCategoria = typeof route.query.categoria === 'string' ? route.query.categoria : ''
  categoriaFiltro.value = valorCategoria
}

watch(
  () => route.query.categoria,
  () => {
    aplicarCategoriaDaRota()
  },
  { immediate: true }
)

onMounted(() => {
  carregarRecentes()
  fetchProdutos()
  aplicarCategoriaDaRota()
})

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement | null
  if (img) img.src = 'https://placehold.co/300x300?text=Produto'
}

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const filtrados = computed(() => {
  const busca = normalizar(search.value)
  const filtroCategoria = normalizar(categoriaFiltro.value)

  return produtos.value.filter((p) => {
    const texto = normalizar(
      `${p.nome} ${p.marca} ${p.categoria || ''} ${p.genero || ''} ${p.categoria_nome || ''} ${p.categoriaNome || ''} ${p.categoria_name || ''} ${p.tipo || ''}`
    )

    const matchBusca = !busca || texto.includes(busca)
    const matchCategoria = !filtroCategoria || texto.includes(filtroCategoria)
    const matchGenero = !categoria.value || p.genero === categoria.value

    return matchBusca && matchCategoria && matchGenero
  })
})

// salvar no histórico
function salvarRecente(valor: string) {
  if (!valor || !valor.trim()) return

  const index = recentes.value.findIndex(r => r.toLowerCase() === valor.toLowerCase())
  if (index !== -1) {
    recentes.value.splice(index, 1)
  }

  recentes.value.unshift(valor)
  recentes.value = recentes.value.slice(0, 20)
  salvarRecentesNoStorage()
}

// quando digita e dá enter
function pesquisar() {
  if (!search.value) return
  salvarRecente(search.value)
  fetchProdutos(search.value)
}

// clicar recente
function usarRecente(item: string) {
  search.value = item
  pesquisar()
}

// remover recente
function removerRecente(index: number) {
  recentes.value.splice(index, 1)
  salvarRecentesNoStorage()
}

// voltar
function voltar() {
  router.back()
}

// abrir produto
function abrirProduto(id: number) {
  router.push(`/produto/${id}`)
}

// abrir camera modal
const mostrarModalCamera = ref(false)

function abrirCameraModal() {
  mostrarModalCamera.value = true
}

function fecharModal() {
  mostrarModalCamera.value = false
}

async function irParaCamera(tipo: "camera" | "gallery") {
  fecharModal()

  if (tipo === 'gallery') {
    // abrir seletor de arquivos, ler imagem e enviar para a página de pesquisa
    return new Promise<void>((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.style.display = 'none'
      document.body.appendChild(input)

      input.onchange = async () => {
        const file = input.files && input.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = () => {
            const data = reader.result as string
            try {
              sessionStorage.setItem('camera-image', data)
            } catch (e) {
              console.warn('Não foi possível salvar a imagem no sessionStorage', e)
            }
            document.body.removeChild(input)
            router.push('/pesquisa-camera')
            resolve()
          }
          reader.readAsDataURL(file)
        } else {
          document.body.removeChild(input)
          resolve()
        }
      }

      input.click()
    })
  }

  // para câmera, navega normalmente
  router.push({ name: 'camera-search', query: { tipo } })
}
</script>
<template>
  <div class="search-page">

    <!-- HEADER -->
    <div class="top-bar">
      <span class="icon-btn" @click="voltar"></span>

      <div class="search-bar">

        <div class="search-input-wrapper">

          <input type="text" v-model="search" @keyup.enter="pesquisar" placeholder="Pesquisar itens..." />

          <span class="search-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>

        </div>

      </div>

      <span class="material-symbols-outlined" @click="abrirCameraModal">
        photo_camera
      </span>
    </div>

    <!-- CONTADOR TEMPORÁRIO PARA TESTE -->
    <p style="padding:10px;font-size:14px">
      Produtos: {{ produtos.length }} |
      Filtrados: {{ filtrados.length }}
    </p>


    <!-- FILTROS -->
    <div class="filters">
      <button :class="{ active: categoria === 'feminino' }" @click="categoria = 'feminino'">
        <div class="icon-circle">
        </div>
        <span>Feminino</span>
      </button>

      <button :class="{ active: categoria === 'masculino' }" @click="categoria = 'masculino'">
        <div class="icon-circle">
        </div>
        <span>Masculino</span>
      </button>

      <button :class="{ active: categoria === 'infantil' }" @click="categoria = 'infantil'">
        <div class="icon-circle">

        </div>
        <span>Infantil</span>
      </button>
    </div>

    <!-- RECENTES -->
    <div v-if="!search.trim()" class="recentes">
      <p class="recentes-title">Pesquisas recentes</p>

      <div class="recentes-list">
        <div class="recente-item" v-for="(item, index) in recentes" :key="index">
          <span @click="usarRecente(item)">
            {{ item }}
          </span>

          <span @click="removerRecente(index)">×</span>
        </div>
      </div>
    </div>

    <!-- RESULTADOS -->
    <div class="results" v-if="filtrados.length">
      <div class="card" v-for="item in filtrados" :key="item.id" @click="abrirProduto(item.id)">
        <img :src="item.imagem" :alt="item.nome" @error="onImgError" />

        <div class="info">
          <h3>{{ item.nome }}</h3>
          <p class="marca">{{ item.marca }}</p>
          <p class="preco">
            R$ {{ Number(item.preco).toFixed(2) }}
          </p>
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-if="search.trim() && !filtrados.length" class="empty">
      <p>Nenhum resultado encontrado</p>
    </div>

    <div v-if="mostrarModalCamera" class="camera-sheet">
      <button @click="irParaCamera('camera')">Tirar foto</button>
      <button @click="irParaCamera('gallery')">Importar da galeria</button>
      <button class="cancel" @click="fecharModal">Cancelar</button>
    </div>
  </div>
</template>
<style scoped src="../css/search.css"></style>
