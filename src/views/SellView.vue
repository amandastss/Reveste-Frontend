<script setup lang="ts">
import { ref } from 'vue'
import '../css/sell.css'

type FormPeca = {
    titulo: string
    descricao: string
    preco: string
    condicao: string
    foto: File | null
}

type ResultadoScanner = {
    aprovado: boolean
    condicao: string
    score: number
    detalhes: string
}

const fileInput = ref<HTMLInputElement | null>(null)
const preview = ref<string>('')
const analisando = ref(false)
const podePublicar = ref(false)
const erroScanner = ref('')
const resultadoIA = ref<ResultadoScanner | null>(null)

const form = ref<FormPeca>({
    titulo: '',
    descricao: '',
    preco: '',
    condicao: '',
    foto: null
})

const abrirGaleria = () => {
    fileInput.value?.click()
}

const previewImagem = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    erroScanner.value = ''
    resultadoIA.value = null
    podePublicar.value = false

    form.value.foto = file
    preview.value = URL.createObjectURL(file)

    await analisarRoupaIA(file)
}

const analisarRoupaIA = async (foto: File) => {
    try {
        analisando.value = true

        const formData = new FormData()
        formData.append('foto', foto)

        const response = await fetch('http://localhost:8000/api/scanner/', {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            throw new Error('Erro ao analisar a imagem')
        }

        const data: ResultadoScanner = await response.json()

        resultadoIA.value = data
        form.value.condicao = data.condicao
        podePublicar.value = data.aprovado
    } catch (error) {
        erroScanner.value = 'Não foi possível analisar a imagem.'
        podePublicar.value = false
        console.error(error)
    } finally {
        analisando.value = false
    }
}

const publicarPeca = () => {
    if (!podePublicar.value) return

    console.log('Peça aprovada para venda:', form.value)
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
                <label>DESCRIÇÃO</label>
                <textarea v-model="form.descricao"></textarea>
            </div>

            <div class="field-group">
                <label>PREÇO</label>
                <input v-model="form.preco" type="text" />
            </div>

            <div class="field-group">
                <label>CONDIÇÃO</label>
                <input v-model="form.condicao" type="text" readonly />
            </div>

            <div class="field-group photos">
                <label>FOTOS</label>

                <div class="photo-tips">
                    <p>Dicas para melhor avaliação da IA:</p>
                    <ul>
                        <li>Prefira a roupa vestida em alguém</li>
                        <li>Use fundo branco ou neutro</li>
                        <li>Boa iluminação</li>
                        <li>Mostre frente, costas e detalhes</li>
                        <li>Evite fotos tremidas</li>
                    </ul>
                </div>

                <button type="button" class="icon-btn" @click="abrirGaleria">
                    Escolher foto
                </button>

                <input ref="fileInput" type="file" accept="image/*" capture="environment" class="hidden-input"
                    @change="previewImagem" />

                <div v-if="preview" class="preview-box">
                    <img :src="preview" alt="Preview" />
                </div>

                <div v-if="analisando" class="scanner-status">
                    🔍 Analisando imagem...
                </div>

                <div v-if="resultadoIA" class="scanner-result">
                    <p><strong>Condição:</strong> {{ resultadoIA.condicao }}</p>
                    <p><strong>Score:</strong> ⭐ {{ resultadoIA.score }}%</p>
                    <p>{{ resultadoIA.detalhes }}</p>
                </div>

                <div v-if="erroScanner" class="scanner-error">
                    {{ erroScanner }}
                </div>
            </div>
            <p v-if="resultadoIA && !podePublicar" class="scanner-error">
                A peça não atingiu a qualidade mínima para venda.
            </p>
            <button class="publish-btn" type="submit" :disabled="!podePublicar || analisando">
                Publicar
            </button>
        </form>
    </div>
</template>