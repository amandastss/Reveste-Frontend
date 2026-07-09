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
      undefined,
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
      localStorage.setItem('token', token)
      localStorage.setItem('isLogin', 'true')
      router.push('/profile')
      return
    }

    localStorage.setItem('isLogin', 'true')
    router.push('/auth/password')
  } catch (err: unknown) {
    console.error(err)

    if (err instanceof Error) {
      alert('Erro: ' + err.message)
    } else {
      alert('Erro ao criar conta')
    }
  }
}
</script>

<template>
  <div class="register-wrapper">
    <div class="register-card">
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
          <img :src="photoPreview" />
        </div>
      </div>

      <input v-model="password" placeholder="Senha" type="password" />

      <button @click="register">Criar conta</button>
    </div>
  </div>
</template>

<style scoped>
/* BACKGROUND */
.register-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fb, #e8ecf5);
  font-family: "Montserrat", sans-serif;
}

/* CARD */
.register-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  padding: 28px;
  border-radius: 20px;

  /* SOMBRA */
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 2px 10px rgba(0, 0, 0, 0.04);

  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* TITLE */
.register-card h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 10px;
}

/* INPUTS */
input {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  transition: 0.2s;
}

/* FOCUS */
input:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

/* ROW */
.field-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.field-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group label {
  font-size: 12px;
  color: #666;
}

/* FOTO */
.photo-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.photo-preview {
  width: 110px;
  height: 110px;
  border-radius: 20px;
  overflow: hidden;

  border: 2px solid #eee;

  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* BUTTON */
button {
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: #000;
  color: white;
  font-weight: 500;
  cursor: pointer;

  transition: 0.2s;
}

/* HOVER */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}

/* CLICK */
button:active {
  transform: scale(0.98);
}
</style>
