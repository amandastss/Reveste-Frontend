<template>
  <div class="login-page">

    <AuthBanner
      @login="goToLogin"
      @register="goToRegister"
    />

    <SocialLogin />

  </div>
</template>

<script setup lang="ts">
import AuthBanner from '@/components/WithOutLogin/AuthBanner.vue'
import SocialLogin from '@/components/WithOutLogin/SocialLogin.vue'

import { useRouter } from 'vue-router'

const router = useRouter()

function goToLogin() {
  router.push('/login-form')
}

function goToRegister() {
  router.push('/register')
}
</script>
