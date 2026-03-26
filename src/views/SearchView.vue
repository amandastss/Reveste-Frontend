<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

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

// histórico
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
    },
    {
        id: 4,
        nome: "Calça Skinny Preta",
        preco: 70,
        marca: "Shein",
        categoria: "calca",
        genero: "feminino",
        imagem: "/src/assets/roupas/calcaskinnypreta.png"
    },

]

// carregar dados
onMounted(() => {
    produtos.value = mock
})

// filtro
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
// clicar em recente
function usarRecente(item: string) {
    search.value = item
}

// remover recente
function removerRecente(index: number) {
    recentes.value.splice(index, 1)
}
</script>

<template>
    <div class="search-page">
        <!-- HEADER TOPO -->
        <div class="top-bar">
            <span class="material-icons">arrow_back</span>

            <div class="search-bar">
                <span class="material-icons">search</span>
                <input type="text" v-model="search" placeholder="Search..." />
            </div>

            <span class="material-icons">photo_camera</span>
        </div>

        <!-- CATEGORIAS -->
        <div class="filters">
            <button @click="categoria = 'feminino'">
                <span class="icon-circle"></span>
                Feminino
            </button>

            <button @click="categoria = 'masculino'">
                <span class="icon-circle"></span>
                Masculino
            </button>

            <button @click="categoria = 'infantil'">
                <span class="icon-circle"></span>
                Infantil
            </button>
        </div>

        <!-- PESQUISAS RECENTES -->
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

        <!-- NÃO DIGITOU -->
        <div v-if="!search" class="recentes">
            <!-- recentes -->
        </div>

        <!-- RESULTADOS -->
        <div v-else-if="filtrados.length" class="results">
            <div class="card" v-for="item in filtrados" :key="item.id">
                <img :src="item.imagem" />

                <div class="info">
                    <h3>{{ item.nome }}</h3>
                    <p class="marca">{{ item.marca }}</p>
                    <p class="preco">R$ {{ item.preco }}</p>
                </div>
            </div>
        </div>

        <!-- NÃO ENCONTROU -->
        <div v-else class="empty">
            <p>Nenhum resultado encontrado</p>
        </div>
    </div>
</template>

<style scoped src="../css/search.css"></style>