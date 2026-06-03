<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '../../api/authApi'

const router = useRouter()
const name = ref('')
const email = ref(localStorage.getItem('email') || '')
const password = ref('')
const birthdate = ref('')
const phone = ref('')
const photo = ref<File | null>(null)
const photoPreview = ref('')

function handlePhotoChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  photo.value = file

  if (!file) {
    photoPreview.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    photoPreview.value = (reader.result as string) || ''
  }
  reader.readAsDataURL(file)
}

async function register() {
  if (!name.value || !email.value || !password.value || !birthdate.value || !phone.value) {
    alert('Preencha todos os campos')
    return
  }

  try {
    const response = await authApi.register(
      email.value,
      name.value,
      password.value,
      'buyer',
      phone.value,
      birthdate.value,
      photo.value ?? undefined,
      undefined
    )

    const responseData = response.data || {}
    const userData = {
      ...responseData,
      name: name.value,
      email: email.value,
      phone: phone.value,
      photo: photoPreview.value,
      date_of_birth: birthdate.value,
    }

    localStorage.setItem('email', email.value)
    localStorage.setItem('user', JSON.stringify(userData))

    const token = typeof responseData.token === 'string' ? responseData.token : undefined
    if (token) {
      try { localStorage.setItem('token', token) } catch {}
      try { localStorage.setItem('isLogin', 'true') } catch {}

      try {
        function extractCandidateId(obj: unknown): string | number | undefined {
          if (!obj || typeof obj !== 'object') return undefined
          const o = obj as Record<string, unknown>
          const uid = o.user_id ?? (o.user && (o.user as Record<string, unknown>).id)
          if (typeof uid === 'string' || typeof uid === 'number') return uid
          return undefined
        }

        const candidateId = extractCandidateId(responseData)
        const serverUser = await authApi.fetchUserFromCandidates(token, candidateId)
        if (serverUser) {
          const enriched = {
            ...userData,
            ...serverUser,
            photo: userData.photo || serverUser.profile_image || serverUser.photo || serverUser.avatar || serverUser.image,
            date_of_birth: userData.date_of_birth || serverUser.birth_date || serverUser.date_of_birth || serverUser.birthdate,
          }
          try { localStorage.setItem('user', JSON.stringify(enriched)) } catch {}
        }
      } catch {}

      router.push('/profile')
      return
    }

    try { localStorage.setItem('isLogin', 'true') } catch {}
    alert('Conta criada com sucesso! Agora faça login.')
    router.push('/auth/password')
  } catch (err: unknown) {
    console.error('Register error:', err)
    const msg = (() => {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        try {
          const e = err as Record<string, unknown>
          const resp = e.response as Record<string, unknown> | undefined
          const data = resp?.data as Record<string, unknown> | undefined
          if (data && typeof data.message === 'string') return data.message
        } catch {}
      }
      return 'Tente novamente'
    })()
    alert('Erro ao criar conta: ' + msg)
  }
}
</script>

<template>
  <div class="register">
    <h1>Criar conta</h1>
    <input v-model="name" placeholder="Nome completo" />
    <input v-model="email" placeholder="Email" type="email" />

    <div class="field-row">
      <div class="field-group">
        <label>Telefone</label>
        <input v-model="phone" placeholder="(xx) xxxxx-xxxx" type="tel" />
      </div>
      <div class="field-group">
        <label>Data de nascimento</label>
        <input v-model="birthdate" type="date" />
      </div>
    </div>

    <div class="photo-field">
      <label>Foto de perfil</label>
      <input type="file" accept="image/*" @change="handlePhotoChange" />
      <div v-if="photoPreview" class="photo-preview">
        <img :src="photoPreview" alt="Foto de perfil" />
      </div>
    </div>

    <input v-model="password" placeholder="Senha" type="password" />
    <button @click="register">Registrar</button>
  </div>
</template>

<style scoped>
.register {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.field-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.field-group label {
  font-size: 12px;
  color: #555;
}

.field-group select,
.field-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.photo-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.photo-preview {
  width: 110px;
  height: 110px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid #ccc;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.field-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.field-group label {
  font-size: 12px;
  color: #555;
}

.field-group select,
.field-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
