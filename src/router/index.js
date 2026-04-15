import { createRouter, createWebHistory } from 'vue-router'

// páginas principais
import HomeView from '@/views/HomeView.vue'
import SearchView from '@/views/SearchView.vue'

// páginas de autenticação
import EmailView from '@/views/auth/EmailView.vue'
import PasswordView from '@/views/auth/PasswordView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import VerifyCodeView from '@/views/auth/VerifyCodeView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // redirect inicial
    {
      path: '/',
      redirect: '/auth/email'
    },

    // AUTH
    {
      path: '/auth/email',
      name: 'email',
      component: EmailView
    },
    {
      path: '/auth/password',
      name: 'password',
      component: PasswordView
    },
    {
      path: '/auth/create-password',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/auth/forgot',
      name: 'forgot',
      component: ForgotPasswordView
    },
    {
      path: '/auth/verify',
      name: 'verify',
      component: VerifyCodeView
    },
    {
      path: '/auth/reset',
      name: 'reset',
      component: ResetPasswordView
    },

    // APP
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true } // 👈 importante
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
      meta: { requiresAuth: true }
    }
  ]
})
router.beforeEach((to, from, next) => {
  const isLogged = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isLogged) {
    return next('/auth/email')
  }

  next()
})

export default router
