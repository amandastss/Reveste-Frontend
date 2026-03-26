import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/menu', component: () => import('../views/MenuView.vue') },
  { path: '/notifications', component: () => import('../views/NotificationsView.vue') },
  { path: '/cart', component: () => import('../views/CartView.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes
})