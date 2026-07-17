import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import SearchView from '@/views/SearchView.vue'
import SellView from '../views/SellView.vue'
import ProfileView from '../views/ProfileView.vue'
import MenuComponent from '@/components/MenuComponent.vue'
import AboutView from '../views/AboutView.vue'
import CameraSearchView from '../views/CameraSearchView.vue'
import PesquisaItensCameraView from '@/views/PesquisaItensCameraView.vue'
import EmailView from '../views/auth/EmailView.vue'
import PasswordView from '../views/auth/PasswordView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '../views/auth/ResetPasswordView.vue'
import VerifyCodeView from '../views/auth/VerifyCodeView.vue'
import SeguindoView from '../views/SeguindoView.vue'
import PedidosView from '../views/PedidosView.vue'
import PedidoDetalheView from '../views/PedidoDetalheView.vue'
import CartView from '../views/CartView.vue'
import ProdutoDetalheView from '../views/ProdutoDetalheView.vue'
import ReviewsView from '../views/ReviewsView.vue'
import AppearanceView from '../views/AppearanceView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import CategoriaView from '../views/CategoriaView.vue'
import EditProfileView from '../views/EditProfileView.vue'
import CategoriaSuporteView from '../views/CategoriaSuporteView.vue'

const router = createRouter({
  history: createWebHistory(),

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
      path: '/categoria/:id',
      name: 'categoria',
      component: CategoriaView,
      props: true,
    },
    {
      path: '/pesquisa-camera',
      name: 'pesquisa-camera',
      component: PesquisaItensCameraView,
    },
    {
      path: '/sell',
      name: 'sell',
      component: SellView,
    },
    {
      path: '/seguindo',
      name: 'seguindo',
      component: SeguindoView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: EditProfileView,
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
      path: '/carrinho',
      name: 'cart',
      component: CartView,
    },

    {
      path: '/pedidos',
      name: 'pedidos',
      component: PedidosView,
    },

    {
      path: '/pedido/:id',
      name: 'pedido-detalhe',
      component: PedidoDetalheView,
    },
    {
      path: '/produto/:id',
      name: 'produto-detalhe',
      component: ProdutoDetalheView,
      props: true, // Permite receber o :id como prop dentro da View
    },
    {
      path: '/produto/:id/avaliacoes',
      name: 'produto-avaliacoes',
      component: ReviewsView,
      props: true,
    },
    {
      path: '/aparencia',
      name: 'aparencia',
      component: AppearanceView,
    },

    {
      path: '/suporte',
      name: 'suporte',
      component: () => import('@/views/SuporteView.vue'),
    },
    {
      path: '/notificacoes',
      name: 'notificacoes',
      component: NotificationsView,
    },

    {
      path: '/suporte/categoria/:tipo',
      component: CategoriaSuporteView
    },

    {
      path: '/suporte',
      name: 'suporte',
      component: () => import('@/views/SuporteView.vue'),
    },

    // AUTH
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
  ],
})

export default router
