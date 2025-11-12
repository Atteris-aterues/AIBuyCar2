import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Onboarding from '../views/Onboarding.vue'
import { isAuthenticated, getCurrentUser, getOnboardKey } from '../utils/auth'
import Logout from '../views/Logout.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Login
  },
  {
    path: '/logout',
    name: 'logout',
    component: Logout,
    meta: { requiresAuth: true }
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: Onboarding,
    meta: { requiresAuth: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/about',
    name: 'about',
    meta: { requiresAuth: true },
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/chat-container',
    name: 'chat-container',
    meta: { requiresAuth: true },
    component: () => import(/* webpackChunkName: "about" */ '../views/ChatInterface.vue')
  },
  {
    path: '/score',
    name: 'score',
    meta: { requiresAuth: true },
    component: () => import(/* webpackChunkName: "score" */ '../views/ScorePage.vue')
  },
  {
    path: '/consult-history',
    name: 'consult-history',
    meta: { requiresAuth: true },
    component: () => import(/* webpackChunkName: "consult" */ '../views/ConsultHistory.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    meta: { requiresAuth: true, requiresAdmin: true },
    component: () => import(/* webpackChunkName: "admin" */ '../views/AdminPage.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(r => r.meta && r.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      return next({ path: '/', query: { redirect: to.fullPath } })
    }
    // 检查管理员权限
    if (to.matched.some(r => r.meta && r.meta.requiresAdmin)) {
      const user = getCurrentUser()
      if (!user || !user.isAdmin) {
        return next({ path: '/chat-container' })
      }
    }
  }
  // 阻止已完成引导的账号再次访问 /onboarding
  if (to.name === 'onboarding') {
    const user = getCurrentUser()
    const onboardKey = getOnboardKey(user)
    if (onboardKey && localStorage.getItem(onboardKey)) {
      return next('/chat-container')
    }
  }
  next()
})

export default router
