
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import SellView from '../views/SellView.vue'
import ProfleView from '../views/ProfileView.vue'
import MenuComponent from '@/components/MenuComponent.vue'
import LoginView from '@/views/LoginView.vue'
import LoginForm from '@/views/LoginForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  {
      path: '/',
      name: 'home',
      component: HomeView,
  },
  {
    path: "/search",
    name: "Search",
    component: SearchView,
  },
  {
  path: '/sell',
  name: 'Sell',
  component: SellView,
  } ,
  {
  path: '/profile',
  name: 'Profile',
  component: ProfleView,
  },
  {
  path: '/menu',
  name: 'Menu',
  component: MenuComponent,
  },
  {
    path: '/login',
    component: LoginView
  },
  {
    path: '/login-form',
    component: LoginForm
  },
  ],
})

export default router
