import { createRouter, createWebHistory } from "vue-router"

const SearchView = () => import("@/views/SearchView.vue")

const routes = [
  {
    path: "/",
    redirect: "/search" // abre direto na busca (melhor UX)
  },
  {
    path: "/search",
    name: "Search",
    component: SearchView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router