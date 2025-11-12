<template>
  <nav class="navbar" v-if="showNav">
    <div class="nav-content">
      <div class="nav-brand">
        <router-link to="/chat-container" class="brand-link">
          <img src="/bot.svg" alt="Logo" class="nav-logo">
          <span class="brand-text">AIBuyCar</span>
        </router-link>
      </div>
      <div class="nav-links">
        <router-link to="/chat-container" class="nav-link">咨询</router-link>
        <router-link to="/consult-history" class="nav-link">记录</router-link>
        <router-link to="/score" class="nav-link">积分</router-link>
        <router-link v-if="isAdmin" to="/admin" class="nav-link">管理</router-link>
      </div>
      <div class="nav-user">
        <span class="user-name">{{ currentUser?.username || '用户' }}</span>
        <router-link to="/logout" class="nav-link logout">退出</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { getCurrentUser } from '@/utils/auth'

export default {
  name: 'NavBar',
  data() {
    return {
      currentUser: null,
      isAdmin: false
    }
  },
  computed: {
    showNav() {
      // 在登录和注册页面不显示导航栏
      return !['home', 'register'].includes(this.$route.name)
    }
  },
  watch: {
    $route() {
      this.loadUserInfo()
    }
  },
  created() {
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      this.currentUser = getCurrentUser()
      // 检查是否是管理员
      this.isAdmin = this.currentUser && this.currentUser.isAdmin === true
    }
  }
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(0, 17, 13, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0,255,156,0.2);
  box-shadow: 0 2px 20px rgba(0,0,0,0.3);
}
.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-brand {
  display: flex;
  align-items: center;
}
.brand-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--text);
  font-weight: 800;
  font-size: 18px;
}
.nav-logo {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 8px rgba(0,255,156,0.4));
}
.brand-text {
  background-image: linear-gradient(90deg, var(--neon), var(--neon-2));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.nav-links {
  display: flex;
  gap: 24px;
  align-items: center;
}
.nav-link {
  color: var(--muted);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
  position: relative;
  padding: 6px 0;
}
.nav-link:hover {
  color: var(--text);
}
.nav-link.router-link-active {
  color: var(--neon);
}
.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--neon);
  box-shadow: 0 0 8px rgba(0,255,156,0.6);
}
.nav-user {
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-name {
  color: var(--text);
  font-size: 14px;
}
.logout {
  color: var(--error);
}
.logout:hover {
  color: #ff8a8a;
}
</style>

