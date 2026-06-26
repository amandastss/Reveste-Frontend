<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'

interface Usuario {
  id: number
  username?: string
  foto?: string | null
  genero?: string
  seguindo?: boolean
}

const usuarios = ref<Usuario[]>([])

const MOCK_USERS: Usuario[] = [
  { id: 1, username: 'joao', foto: null, seguindo: true },
  { id: 2, username: 'maria', foto: null, seguindo: false },
  { id: 3, username: 'ana', foto: null, seguindo: true }
]

const aba = ref<'seguindo' | 'seguidores'>('seguindo')
const search = ref('')

const carregarUsuarios = async (): Promise<void> => {
  try {
    const endpoint = aba.value === 'seguindo' ? '/api/seguindo/' : '/api/seguidores/'
    const response = await axios.get(endpoint, {
      params: { search: search.value }
    })

    console.log('carregarUsuarios -> endpoint:', endpoint)
    console.log('carregarUsuarios -> response.data:', response.data)

    const payload = response.data?.results ?? response.data?.data ?? response.data
    const lista = Array.isArray(payload) ? payload : []

    if (!lista.length) {
      console.warn('carregarUsuarios: lista vazia, usando MOCK_USERS para depuração')
      usuarios.value = MOCK_USERS.map(u => ({ ...u }))
      return
    }

    usuarios.value = lista.map((u: unknown) => {
      const usuarioObj = u as Usuario
      return {
        ...usuarioObj,
        seguindo: typeof usuarioObj.seguindo === 'boolean' ? usuarioObj.seguindo : aba.value === 'seguindo'
      }
    })
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
    usuarios.value = []
  }
}

const mudarAba = (valor: 'seguindo' | 'seguidores') => { aba.value = valor }

const toggleFollow = (usuario: Usuario) => { usuario.seguindo = !usuario.seguindo }

watch([aba, search], carregarUsuarios, { immediate: true })
</script>
<template>
  <div class="seguindo">

    <h2 class="titulo">{{ aba === 'seguindo' ? 'SEGUINDO' : 'SEGUIDORES' }}</h2>

    <input v-model="search" placeholder="Pesquisar" class="search" />

    <div class="tabs">
      <button :class="{ active: aba === 'seguindo' }" @click="mudarAba('seguindo')">Seguindo</button>
      <button :class="{ active: aba === 'seguidores' }" @click="mudarAba('seguidores')">Seguidores</button>
    </div>

    <div
      v-for="usuario in usuarios"
      :key="usuario.id"
      class="item"
    >
      <img
        :src="usuario.foto ?? '/images/default-avatar.png'"
        class="avatar"
      />

      <div class="info">
        @{{ usuario.username }}
      </div>

      <button
        class="following"
        :class="{ inactive: !usuario.seguindo }"
        @click="toggleFollow(usuario)"
      >
        {{ usuario.seguindo ? 'Seguindo' : 'Seguir' }}
      </button>
    </div>

  </div>
</template>

<style scoped>
.seguindo {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.seguindo h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 700;
}

.search {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: #f3f3f3;
  font-size: 14px;
  outline: none;
}

.tabs {
  display: flex;
  margin-top: 20px;
  border-bottom: 1px solid #eee;
}

.tabs button {
  flex: 1;
  padding: 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
}

.tabs button.active {
  border-bottom: 2px solid #000;
  font-weight: 700;
}

.item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f3f3f3;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.info {
  flex: 1;
  margin-left: 12px;
  font-size: 15px;
  font-weight: 600;
}

.following {
  border: 1px solid #000;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  background: #000;
  color: #fff;
  transition: 0.2s ease;
}

.following.inactive {
  background: #fff;
  color: #000;
}

.following:hover {
  opacity: 0.9;
}

.empty {
  text-align: center;
  padding: 30px;
  color: #888;
}
</style>
