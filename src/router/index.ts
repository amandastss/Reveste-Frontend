
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '@/views/SearchView.vue'
import SellView from '../views/SellView.vue'
import ProfleView from '../views/ProfileView.vue' 
import MenuComponent from '@/components/MenuComponent.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
    path: "/",
    redirect: "/search"
  },
  {
    path: "/search",
    name: "Search",
    component: SearchView,
  },
  {
  path: '/sell',
  name: 'sell',
  component: SellView,
  } ,
  {
  path: '/profile',
  name: 'profile',
  component: ProfleView,
  },
  {
  path: '/menu',
  name: 'menu',
  component: MenuComponent,
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