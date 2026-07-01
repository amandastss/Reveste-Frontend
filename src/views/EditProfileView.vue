<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '@/api/authApi'

const router = useRouter()
const isSaving = ref(false)
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

type StoredUser = Record<string, unknown>

const getStoredUser = (): StoredUser => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

const user = ref<StoredUser>(getStoredUser())
const form = ref({
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  bio: ''
})
const photoFile = ref<File | null>(null)
const photoPreview = ref('')

function getImagePreview(value: unknown): string {
  if (typeof value !== 'string' || !value) return ''
  return value.startsWith('http') ? value : `${import.meta.env.VITE_API_URL}/api${value}`
}

function handlePhotoChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  photoFile.value = file

  if (!file) {
    photoPreview.value = getImagePreview(
      user.value.photo || user.value.profile_image || user.value.avatar || user.value.image
    )
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    photoPreview.value = (reader.result as string) || ''
  }
  reader.readAsDataURL(file)
}

onMounted(() => {
  const currentUser = getStoredUser()
  user.value = currentUser

  form.value = {
    name: typeof currentUser.name === 'string' ? currentUser.name : '',
    email: typeof currentUser.email === 'string' ? currentUser.email : '',
    phone: typeof currentUser.phone === 'string' ? currentUser.phone : '',
    birthDate:
      typeof currentUser.date_of_birth === 'string'
        ? currentUser.date_of_birth
        : typeof currentUser.birth_date === 'string'
          ? currentUser.birth_date
          : '',
    bio: typeof currentUser.bio === 'string' ? currentUser.bio : ''
  }

  photoPreview.value = getImagePreview(
    currentUser.photo || currentUser.profile_image || currentUser.avatar || currentUser.image
  )
})

async function saveProfile() {
  if (!form.value.name.trim() || !form.value.email.trim()) {
    feedback.value = 'Preencha nome e e-mail para continuar.'
    feedbackType.value = 'error'
    return
  }

  isSaving.value = true
  feedback.value = ''

  try {
    const payload = {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim(),
      birth_date: form.value.birthDate,
      bio: form.value.bio.trim()
    }

    const serverUser = await authApi.updateProfile({
      ...payload,
      profile_image: photoFile.value || undefined
    })

    const mergedUser = {
      ...(user.value || {}),
      ...payload,
      date_of_birth: form.value.birthDate,
      birth_date: form.value.birthDate,
      photo: photoPreview.value || (typeof user.value.photo === 'string' ? user.value.photo : ''),
      profile_image: photoPreview.value || (typeof user.value.profile_image === 'string' ? user.value.profile_image : ''),
      ...(serverUser && typeof serverUser === 'object' ? (serverUser as StoredUser) : {})
    }

    localStorage.setItem('user', JSON.stringify(mergedUser))
    localStorage.setItem('email', payload.email)

    feedback.value = 'Perfil atualizado com sucesso!'
    feedbackType.value = 'success'
    setTimeout(() => router.push('/profile'), 400)
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    feedback.value = 'Não foi possível salvar agora. Tente novamente.'
    feedbackType.value = 'error'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="edit-profile-page">
    <div class="edit-profile-card">
      <div class="header">
        <button class="back-button" @click="router.push('/profile')">← Voltar</button>
        <h1>Editar perfil</h1>
      </div>

      <form class="form" @submit.prevent="saveProfile">
        <div class="photo-section">
          <div class="photo-preview-box">
            <img v-if="photoPreview" :src="photoPreview" alt="Foto de perfil" />
            <span v-else>Foto</span>
          </div>
          <label class="photo-upload">
            <span>Trocar foto</span>
            <input type="file" accept="image/*" @change="handlePhotoChange" />
          </label>
        </div>

        <label>
          Nome
          <input v-model="form.name" placeholder="Seu nome" />
        </label>

        <label>
          E-mail
          <input v-model="form.email" type="email" placeholder="seu@email.com" />
        </label>

        <label>
          Telefone
          <input v-model="form.phone" type="tel" placeholder="(xx) xxxxx-xxxx" />
        </label>

        <label>
          Data de nascimento
          <input v-model="form.birthDate" type="date" />
        </label>

        <label>
          Bio
          <textarea v-model="form.bio" rows="4" placeholder="Conte um pouco sobre você" />
        </label>

        <p v-if="feedback" class="feedback" :class="feedbackType">{{ feedback }}</p>

        <button class="save-button" type="submit" :disabled="isSaving">
          {{ isSaving ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  background: var(--app-bg);
  padding: 24px 16px 48px;
  display: flex;
  justify-content: center;
}

.edit-profile-card {
  width: 100%;
  max-width: 620px;
  background: var(--surface-bg);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 12px 30px var(--shadow-color);
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.back-button {
  border: none;
  background: transparent;
  color: var(--text-color);
  font-weight: 600;
  cursor: pointer;
}

h1 {
  margin: 0;
  font-size: 20px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  color: var(--text-color);
}

.photo-section {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}

.photo-preview-box {
  width: 90px;
  height: 90px;
  border-radius: 20px;
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--text-muted);
  font-weight: 600;
}

.photo-preview-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-upload {
  cursor: pointer;
  color: var(--text-color);
  font-size: 14px;
}

.photo-upload input {
  display: none;
}

input,
textarea {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
  background: var(--surface-elevated);
  color: var(--text-color);
}

textarea {
  resize: vertical;
}

.save-button {
  border: none;
  border-radius: 10px;
  padding: 12px;
  background: var(--primary-color, #111);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.save-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.feedback {
  font-size: 14px;
  margin: 0;
}

.feedback.success {
  color: #0f8a3f;
}

.feedback.error {
  color: #c0392b;
}
</style>
