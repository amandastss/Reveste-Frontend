<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

interface Produto {
    id: number
    nome: string
    preco: number
    marca: string
    categoria: string
    genero: string
    imagem: string
}

const search = ref("")
const categoria = ref("")
const produtos = ref<Produto[]>([])

const recentes = ref<string[]>([
    "Calças",
    "Blusas",
    "Sapatos",
    "Jaqueta"
])

const mock: Produto[] = [
    {
        id: 1,
        nome: "Blusa Laranja Básica",
        preco: 50,
        marca: "Nike",
        categoria: "camiseta",
        genero: "feminino",
        imagem: "/src/assets/roupas/blusalaranjabasica.png"
    },
    {
        id: 2,
        nome: "Calça Jeans Skinny",
        preco: 90,
        marca: "Zara",
        categoria: "calca",
        genero: "feminino",
        imagem: "/src/assets/roupas/calcajeansskinny.png"
    },
    {
        id: 3,
        nome: "Calça Skinny",
        preco: 70,
        marca: "Shein",
        categoria: "calca",
        genero: "feminino",
        imagem: "/src/assets/roupas/calcaskinny.png"
    }
]

onMounted(() => {
    produtos.value = mock
})

function normalizar(texto: string) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
}

const filtrados = computed(() => {
    const busca = normalizar(search.value)

    return produtos.value.filter((p) => {
        const texto = normalizar(
            p.nome + " " + p.marca + " " + p.categoria
        )

        const matchBusca = !busca || texto.includes(busca)
        const matchGenero =
            !categoria.value || p.genero === categoria.value

        return matchBusca && matchGenero
    })
})

// salvar no histórico
function salvarRecente(valor: string) {
    if (!valor) return

    if (!recentes.value.includes(valor)) {
        recentes.value.unshift(valor)
    }
}

// quando digita e dá enter
function pesquisar() {
    salvarRecente(search.value)
}

// clicar recente
function usarRecente(item: string) {
    search.value = item
}

// remover recente
function removerRecente(index: number) {
    recentes.value.splice(index, 1)
}

// voltar
function voltar() {
    router.back()
}

// abrir produto
function abrirProduto(id: number) {
    router.push(`/produto/${id}`)
}

// abrir camera
const mostrarModalCamera = ref(false)

function abrirCameraModal() {
    mostrarModalCamera.value = true
}

function fecharModal() {
    mostrarModalCamera.value = false
}

function irParaCamera(tipo: "camera" | "gallery") {
    mostrarModalCamera.value = false
    router.push(`/camera-search?tipo=${tipo}`)
}
</script>
<template>
    <div class="search-page">

        <!-- HEADER -->
        <div class="top-bar">
            <span class="material-icons" @click="voltar">arrow_back</span>

            <div class="search-bar">
                <input type="text" v-model="search" @keyup.enter="pesquisar" placeholder="Buscar..." />
            </div>

            <span class="material-icons" @click="abrirCameraModal">
                photo_camera
            </span>
        </div>

        <!-- FILTROS -->
        <div class="filters">
            <button :class="{ active: categoria === 'feminino' }" @click="categoria = 'feminino'">
                <div class="icon-circle">
                    <span class="material-icons">person_outline</span>
                </div>
                <span>Feminino</span>
            </button>

            <button :class="{ active: categoria === 'masculino' }" @click="categoria = 'masculino'">
                <div class="icon-circle">
                    <span class="material-icons">person_outline</span>
                </div>
                <span>Masculino</span>
            </button>

            <button :class="{ active: categoria === 'infantil' }" @click="categoria = 'infantil'">
                <div class="icon-circle">
                    <span class="material-icons">person_outline</span>
                </div>
                <span>Infantil</span>
            </button>
        </div>

        <!-- RECENTES -->
        <div v-if="!search" class="recentes">
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
        <div v-else-if="filtrados.length" class="results">
            <div class="card" v-for="item in filtrados" :key="item.id" @click="abrirProduto(item.id)">
                <img :src="item.imagem" />

                <div class="info">
                    <h3>{{ item.nome }}</h3>
                    <p class="marca">{{ item.marca }}</p>
                    <p class="preco">R$ {{ item.preco }}</p>
                </div>
            </div>
        </div>

        <!-- EMPTY -->
        <div v-else class="empty">
            <p>Nenhum resultado encontrado</p>
        </div>
    </div>
    <div v-if="mostrarModalCamera" class="camera-modal">
        <div class="camera-overlay" @click="fecharModal"></div>

        <div class="camera-sheet">
            <button @click="irParaCamera('camera')">Take a photo</button>
            <button @click="irParaCamera('gallery')">Browse from Gallery</button>
            <button class="cancel" @click="fecharModal">Cancel</button>
        </div>
    </div>
</template>

<style scoped src="../css/search.css"></style>
