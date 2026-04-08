import { createRouter, createWebHistory } from "vue-router"

const SearchView = () => import("@/views/SearchView.vue")
const CameraSearchView = () => import("@/views/CameraSearchView.vue")
const SellView = () => import("@/views/SellView.vue")

const routes = [
  {
    path: "/",
    redirect: "/search"
  },
  {
    path: "/search",
    name: "Search",
    component: SearchView
  },
  {
    path: "/camera-search",
    name: "CameraSearch",
    component: CameraSearchView
  },
  {
  path: '/sell',
  name: 'sell',
  component: SellView
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