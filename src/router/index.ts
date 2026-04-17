import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '@/views/SearchView.vue'
import SellView from '../views/SellView.vue'
import ProfleView from '../views/ProfleView.vue' 

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
  }
  ],
})

export default router