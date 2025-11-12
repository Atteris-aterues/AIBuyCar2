<template>
  <div class="login-page">
    <div class="hero">
      <img class="logo" alt="Logo" src="/bot.svg">
      <h1 class="title chroma">AIBuyCar</h1>
      <p class="subtitle">正在安全退出<span class="cursor">_</span></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Logout',
  async created() {
    try {
      const { clearToken, clearCurrentUser } = await import('../utils/auth')
      clearToken()
      clearCurrentUser()
    } catch (e) {}
    const redirect = this.$route.query.redirect || '/'
    this.$router.replace(redirect)
  }
}
</script>

<style scoped>
.login-page { min-height: 60vh; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.hero { text-align: center; }
.logo { width: 60px; height: 60px; opacity: .95; filter: drop-shadow(0 0 14px rgba(0,255,156,.35)); }
.title { margin: 12px 0 4px; font-size: 28px; font-weight: 900; letter-spacing: .5px; color: var(--text); }
.title.chroma {
  background-image: linear-gradient(90deg, var(--neon), var(--neon-2), var(--amber), var(--neon));
  background-size: 300% 100%;
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  animation: chromaShift 6s linear infinite;
}
.subtitle { margin: 0; font-size: 14px; color: var(--muted); }
.cursor { animation: blink 1.1s steps(1,end) infinite; margin-left: 2px; }
@keyframes blink { 50% { opacity: 0; } }
@keyframes chromaShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
</style>




