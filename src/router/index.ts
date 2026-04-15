import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '@/views/SearchView.vue'
import SellView from '../views/SellView.vue'

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
  }
  ],
})

export default router