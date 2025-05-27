import { createRouter, createWebHistory } from 'vue-router'
import BrewView from '../views/brew/BrewView.vue'
import PythonView from '../views/python/PythonView.vue'

const routes = [
  {
    path: '/brew',
    name: 'brew',
    component: BrewView
  },
  {
    path: '/python',
    name: 'python',
    component: PythonView
  },
  {
    path: '/',
    redirect: '/brew'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router