<script setup lang="ts">
import { ref } from 'vue'
import '../css/sell.css'

const fileInput = ref<HTMLInputElement | null>(null)
const preview = ref('')

const form = ref({
  titulo: '',
  descricao: '',
  preco: '',
  condicao: '',
  marca: '',
  foto: null as File | null,
})

const abrirGaleria = () => {
  fileInput.value?.click()
}

const previewImagem = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  form.value.foto = file
  preview.value = URL.createObjectURL(file)
}

const publicarPeca = async () => {
  if (!form.value.titulo || !form.value.preco || !form.value.condicao) {
    alert('Preencha os campos obrigatórios')
    return
  }

  try {
    let imagemUrl = ''

    // Upload da imagem
    if (form.value.foto) {
      imagemUrl = await uploadImagem(form.value.foto)
    }

    // Criar produto
    const formData = new FormData()

    formData.append('nome', form.value.titulo)
    formData.append('descricao', form.value.descricao)
    formData.append('preco', form.value.preco)
    formData.append('condicao', form.value.condicao)
    formData.append('marca', form.value.marca)

    if (imagemUrl) {
      formData.append('imagem_url', imagemUrl)
    }

    const res = await fetch('http://localhost:8000/api/produtos/', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('ERRO PRODUTO:', err)
      throw new Error()
    }

    alert('Produto publicado com sucesso!')

    // reset
    form.value = {
      titulo: '',
      descricao: '',
      preco: '',
      condicao: '',
      marca: '',
      foto: null,
    }

    preview.value = ''
  } catch (e) {
    console.error(e)
    alert('Erro ao publicar o produto.')
  }
}

const uploadImagem = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('http://localhost:8000/api/media/images/', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json()
    console.error('ERRO UPLOAD:', err)
    throw new Error('Erro no upload da imagem')
  }

  const data = await res.json()

  console.log('UPLOAD OK:', data)

  return data.file
}
</script>

<template>
  <div class="sell-page">
    <header class="top-bar">
      <button class="back-btn" @click="$router.back()">←</button>
      <h1>VENDER</h1>
    </header>

    <form class="sell-form" @submit.prevent="publicarPeca">
      <div class="field-group">
        <label>NOME DO PRODUTO</label>
        <input v-model="form.titulo" type="text" />
      </div>

      <div class="field-group">
        <label>MARCA</label>
        <input v-model="form.marca" type="text" />
      </div>

      <div class="field-group">
        <label>DESCRIÇÃO</label>
        <textarea v-model="form.descricao"></textarea>
      </div>

      <div class="field-group">
        <label>PREÇO</label>
        <input v-model="form.preco" type="number" step="0.01" />
      </div>

      <div class="field-group">
        <label>CONDIÇÃO</label>
        <select v-model="form.condicao">
          <option value="">Selecione</option>
          <option value="novo">Novo</option>
          <option value="seminovo">Seminovo</option>
          <option value="usado">Usado</option>
        </select>
      </div>

      <div class="field-group photos">
        <label>FOTOS</label>

        <button type="button" class="icon-btn" @click="abrirGaleria">Escolher foto</button>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden-input"
          @change="previewImagem"
        />

        <div v-if="preview" class="preview-box">
          <img :src="preview" alt="Preview" />
        </div>
      </div>

      <button class="publish-btn" type="submit">Publicar</button>
    </form>
  </div>
</template>
