<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"

const router = useRouter()
const route = useRoute()

const previews = ref<string[]>([])
const imagem = ref<string | null>(null)

const resultados = ref<{
  id: number
  nome: string
  preco: number
  imagem: string
}[]>([])

const fileInput = ref<HTMLInputElement | null>(null)
// 🔥 abre automaticamente baseado na escolha

onMounted(() => {
  const tipo = route.query.tipo

  if (tipo === "camera" || tipo === "gallery") {
    abrirInput(tipo)
  }
})

function abrirInput(tipo: string) {
  if (!fileInput.value) return

  if (tipo === "camera") {
    fileInput.value.setAttribute("capture", "environment")
  } else {
    fileInput.value.removeAttribute("capture")
  }

  fileInput.value.click()
}

// captura
function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    voltar() // usuário cancelou
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    imagem.value = reader.result as string
    buscarSemelhantes()
  }

  reader.readAsDataURL(file)
}

// resultados fake
function buscarSemelhantes() {
  if (!imagem.value) return

  previews.value = [
    imagem.value,
    "/src/assets/roupas/calcajeansskinny.png",
    "/src/assets/roupas/blusalaranjabasica.png"
  ]

  resultados.value = [
    {
      id: 1,
      nome: "Calça Jeans Skinny",
      preco: 76.44,
      imagem: "/src/assets/roupas/calcajeansskinny.png"
    },
    {
      id: 2,
      nome: "Blusa laranja básica",
      preco: 100,
      imagem: "/src/assets/roupas/blusalaranjabasica.png"
    }
  ]
}

// voltar sempre funciona
function voltar() {
  router.back()
}
</script>

<template>
  <div class="camera-page">

    <!-- HEADER -->
    <div class="top-bar">
      <span class="material-icons" @click="voltar">arrow_back</span>
      <p>PESQUISE PELA FOTO</p>
    </div>

    <!-- INPUT escondido -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      capture="environment"
      hidden
      @change="onFileChange"
    />

    <!-- PREVIEWS -->
    <div class="preview-list" v-if="previews.length">
      <img v-for="(img, i) in previews" :key="i" :src="img" />
    </div>

    <!-- RESULTADOS -->
    <div class="grid" v-if="resultados.length">
      <div class="item" v-for="item in resultados" :key="item.id">
        <img :src="item.imagem" />
        <p class="nome">{{ item.nome }}</p>
        <p class="preco">R$ {{ item.preco }}</p>
      </div>
    </div>

  </div>
</template>

<style scoped src="../css/camera-search.css"></style>