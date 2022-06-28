import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import store from '@/store/index.js'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    beforeEnter(to, from, next) {
      // ログインされていたらダッシュボードへ移動
      if (store.getters.uid !== null) {
        next('/dashboard');
      }
      // それ以外の場合は通常表示
      next();
    }
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    beforeEnter(to, from, next) {
      // ログインされていなかったらログイン画面へ移動
      if (store.getters.uid == null) {
        next('/');
      }
      // それ以外の場合は通常表示
      next();
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
