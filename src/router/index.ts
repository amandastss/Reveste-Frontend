
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '@/views/SearchView.vue'
import SellView from '../views/SellView.vue'
import ProfileView from '../views/ProfileView.vue' 
import MenuComponent from '@/components/MenuComponent.vue'
import CartView from '@/views/CartView.vue'

const router = createRouter({
  history: createWebHistory(),
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
  component: ProfileView,
  },
  {
  path: '/menu',
  name: 'menu',
  component: MenuComponent,
  },
  {
  path: '/cart',
  name: 'cart',
  component: CartView,
  }
  ],

})

export default router