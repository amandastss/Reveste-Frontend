
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '@/views/SearchView.vue'
import SellView from '../views/SellView.vue'
import ProfileView from '../views/ProfileView.vue'
import MenuComponent from '@/components/MenuComponent.vue'
import AboutView from '../views/AboutView.vue'
import CameraSearchView from '../views/CameraSearchView.vue'
import EmailView from '../views/auth/EmailView.vue'
import PasswordView from '../views/auth/PasswordView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '../views/auth/ResetPasswordView.vue'
import VerifyCodeView from '../views/auth/VerifyCodeView.vue'
import PedidosView from '../views/PedidosView.vue';
import PedidoDetalheView from '../views/PedidoDetalheView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/sell',
      name: 'sell',
      component: SellView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/menu',
      name: 'menu',
      component: MenuComponent,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/camera-search',
      name: 'camera-search',
      component: CameraSearchView,
    },
    {
      path: '/auth/email',
      alias: '/auth-email',
      name: 'auth-email',
      component: EmailView,
    },
    {
      path: '/auth/password',
      name: 'auth-password',
      component: PasswordView,
    },
    {
      path: '/auth/register',
      name: 'auth-register',
      component: RegisterView,
    },
    {
      path: '/auth/forgot-password',
      name: 'auth-forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/auth/reset-password',
      name: 'auth-reset-password',
      component: ResetPasswordView,
    },
    {
      path: '/auth/verify-code',
      name: 'auth-verify-code',
      component: VerifyCodeView,
    },
    {
    path: '/pedidos',
    component: PedidosView,
  },

  {
    path: '/pedido/:id',
    component: PedidoDetalheView,
  },
  {
  path: '/suporte',
  component: () => import('@/views/SuporteView.vue')
},
{
  path: '/suporte/categoria',
  component: () => import('@/views/CategoriaSuporteView.vue')
}
  ],
})

export default router
