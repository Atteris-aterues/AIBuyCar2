<template>
  <div class="login-page">
    <div class="hero">
      <img class="logo" alt="Logo" src="/bot.svg">
      <h1 class="title chroma">AIBuyCar</h1>
      <p class="subtitle">完善你的偏好，获取更精准的购车推荐<span class="cursor">_</span></p>
    </div>

    <form class="card" @submit.prevent="submit">
      <div class="field">
        <label class="label" for="budget">预算区间 (万元)</label>
        <select id="budget" class="input input-terminal" v-model="form.budget">
          <option disabled value="">请选择预算</option>
          <option value="10以下">10 以下</option>
          <option value="10-20">10 - 20</option>
          <option value="20-30">20 - 30</option>
          <option value="30-50">30 - 50</option>
          <option value="50以上">50 以上</option>
        </select>
      </div>

      <div class="field">
        <label class="label" for="purpose">购车用途</label>
        <select id="purpose" class="input input-terminal" v-model="form.purpose">
          <option disabled value="">请选择用途</option>
          <option value="通勤代步">通勤代步</option>
          <option value="家庭出行">家庭出行</option>
          <option value="长途旅行">长途旅行</option>
          <option value="商务接待">商务接待</option>
          <option value="性能驾驶">性能驾驶</option>
        </select>
      </div>

      <div class="field">
        <label class="label">人数与空间</label>
        <div class="grid">
          <select class="input input-terminal" v-model="form.seats">
            <option disabled value="">座位数</option>
            <option>2</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
          </select>
          <select class="input input-terminal" v-model="form.bodyType">
            <option disabled value="">车型</option>
            <option value="轿车">轿车</option>
            <option value="SUV">SUV</option>
            <option value="MPV">MPV</option>
            <option value="旅行车">旅行车</option>
            <option value="跑车">跑车</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label class="label">动力与驱动</label>
        <div class="grid">
          <select class="input input-terminal" v-model="form.fuel">
            <option disabled value="">燃料类型</option>
            <option value="燃油">燃油</option>
            <option value="混动">混动</option>
            <option value="插混">插混</option>
            <option value="纯电">纯电</option>
          </select>
          <select class="input input-terminal" v-model="form.drive">
            <option disabled value="">驱动形式</option>
            <option value="前驱">前驱</option>
            <option value="后驱">后驱</option>
            <option value="四驱">四驱</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label class="label">换挡与里程</label>
        <div class="grid">
          <select class="input input-terminal" v-model="form.transmission">
            <option disabled value="">变速箱</option>
            <option value="自动">自动</option>
            <option value="手动">手动</option>
            <option value="不限">不限</option>
          </select>
          <select class="input input-terminal" v-model="form.mileage">
            <option disabled value="">年行驶里程</option>
            <option value="1万以内">1 万以内</option>
            <option value="1-2万">1 - 2 万</option>
            <option value="2-3万">2 - 3 万</option>
            <option value="3万以上">3 万以上</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label class="label" for="brands">偏好品牌（可多选，逗号分隔）</label>
        <input id="brands" class="input input-terminal" v-model.trim="form.brands" placeholder="如：本田, 丰田, 宝马">
      </div>

      <div class="field">
        <label class="label">其它偏好</label>
        <div class="tags">
          <label><input type="checkbox" v-model="form.tags" value="智能驾驶"> 智能驾驶</label>
          <label><input type="checkbox" v-model="form.tags" value="大屏娱乐"> 大屏娱乐</label>
          <label><input type="checkbox" v-model="form.tags" value="安全优先"> 安全优先</label>
          <label><input type="checkbox" v-model="form.tags" value="节能经济"> 节能经济</label>
          <label><input type="checkbox" v-model="form.tags" value="动力性能"> 动力性能</label>
        </div>
      </div>

      <button class="primary btn-neon" type="submit" :disabled="submitting">
        {{ submitting ? '正在保存…' : '保存偏好并继续' }}
      </button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>

    <p class="footer">
      可在个人设置中随时修改偏好
    </p>
  </div>
</template>

<script>
import { getCurrentUser, getOnboardKey, getProfileKey } from '@/utils/auth'

export default {
  name: 'Onboarding',
  data() {
    return {
      submitting: false,
      errorMessage: '',
      form: {
        budget: '',
        purpose: '',
        seats: '',
        bodyType: '',
        fuel: '',
        drive: '',
        transmission: '',
        mileage: '',
        brands: '',
        tags: []
      }
    }
  },
  created() {
    try {
      const user = getCurrentUser()
      const onboardKey = getOnboardKey(user)
      if (onboardKey && localStorage.getItem(onboardKey)) {
        this.$router.replace('/chat-container')
        return
      }
      const profileKey = getProfileKey(user)
      const saved = localStorage.getItem(profileKey)
      if (saved) {
        this.form = Object.assign(this.form, JSON.parse(saved))
      }
    } catch (e) {}
  },
  methods: {
    validate() {
      if (!this.form.budget) { this.errorMessage = '请选择预算区间'; return false }
      if (!this.form.purpose) { this.errorMessage = '请选择购车用途'; return false }
      if (!this.form.seats || !this.form.bodyType) { this.errorMessage = '请选择人数与车型'; return false }
      if (!this.form.fuel) { this.errorMessage = '请选择燃料类型'; return false }
      this.errorMessage = ''
      return true
    },
    async submit() {
      if (!this.validate()) return
      this.submitting = true
      try {
        const user = getCurrentUser()
        const profileKey = getProfileKey(user)
        localStorage.setItem(profileKey, JSON.stringify(this.form))
        const onboardKey = getOnboardKey(user)
        if (onboardKey) {
          localStorage.setItem(onboardKey, '1')
        }
        // 未来可在此调用后端接口进行个性化建模
        await new Promise(r => setTimeout(r, 500))
        this.$router.push('/chat-container')
      } catch (e) {
        this.errorMessage = '保存失败，请稍后再试'
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: radial-gradient(1200px 600px at 50% -10%, rgba(0,255,156,0.15), transparent 60%),
              radial-gradient(800px 400px at 100% 10%, rgba(56,189,248,0.12), transparent 60%);
}
.hero { text-align: center; margin-bottom: 24px; }
.logo { width: 68px; height: 68px; opacity: 0.95; filter: drop-shadow(0 0 14px rgba(0,255,156,0.35)); }
.title { margin: 12px 0 4px; font-size: 34px; font-weight: 900; letter-spacing: 0.5px; color: var(--text); }
.title.chroma {
  background-image: linear-gradient(90deg, var(--neon), var(--neon-2), var(--amber), var(--neon));
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: chromaShift 6s linear infinite;
  text-shadow: none;
}
@keyframes chromaShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}}
.subtitle { margin: 0; font-size: 14px; color: var(--muted); }
.cursor { animation: blink 1.1s steps(1,end) infinite; margin-left: 2px; }
@keyframes blink { 50% { opacity: 0; } }
.card {
  width: 100%;
  max-width: 520px;
  background: rgba(0, 17, 13, 0.6);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,255,156,0.18);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35), 0 0 24px rgba(0,255,156,0.08), inset 0 1px 0 rgba(255,255,255,0.04);
}
.field { position: relative; margin-bottom: 14px; }
.label { display: block; margin-bottom: 6px; font-size: 13px; color: var(--muted); }
.input {
  width: 100%; box-sizing: border-box; height: 40px; padding: 0 12px; border-radius: 8px;
  border: 1px solid rgba(148,163,184,0.18); background: rgba(0, 17, 13, 0.75); color: var(--text);
  outline: none; transition: border-color .2s, box-shadow .2s, background .2s;
}
.input:focus { border-color: var(--neon); box-shadow: 0 0 0 3px rgba(0,255,156,0.18); background: rgba(0, 17, 13, 0.9); }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.tags { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; color: var(--muted); }
.primary { width: 100%; height: 42px; border-radius: 10px; border: none; background: linear-gradient(135deg, var(--neon), var(--neon-2)); color: #00110d; font-weight: 800; letter-spacing: 0.3px; cursor: pointer; transition: transform .08s ease, filter .2s ease, opacity .2s ease; }
.primary:disabled { opacity: 0.7; cursor: not-allowed; }
.primary:not(:disabled):active { transform: translateY(1px); filter: brightness(0.95); }
.error { margin-top: 12px; color: var(--error); font-size: 13px; }
.footer { margin-top: 14px; font-size: 12px; color: var(--muted); }
</style>


