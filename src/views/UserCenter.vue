<template>
  <div class="user-center">
    <h2>个人中心</h2>

    <form class="card" @submit.prevent="saveProfile">
      <div class="field">
        <label for="name">姓名</label>
        <input id="name" v-model.trim="profile.name" type="text" placeholder="你的姓名" />
      </div>

      <div class="field">
        <label for="mobile">手机号</label>
        <input id="mobile" v-model.trim="profile.mobile" type="tel" placeholder="你的手机号" />
      </div>

      <div class="field">
        <label for="budget">购车预算（万元）</label>
        <input id="budget" v-model.number="profile.budget" type="number" min="0" step="0.1" placeholder="例如：15.0" />
      </div>

      <div class="field">
        <label for="preferred_type">偏好车型</label>
        <input id="preferred_type" v-model.trim="profile.preferred_type" type="text" placeholder="SUV / 轿车 / MPV…" />
      </div>

      <div class="field">
        <label for="use_case">主要使用场景</label>
        <input id="use_case" v-model.trim="profile.use_case" type="text" placeholder="通勤 / 家庭 / 商务…" />
      </div>

      <div class="field">
        <label for="fuel_type">燃料类型偏好</label>
        <input id="fuel_type" v-model.trim="profile.fuel_type" type="text" placeholder="燃油 / 电动 / 混动…" />
      </div>

      <div class="field">
        <label for="brand_preference">品牌偏好</label>
        <input id="brand_preference" v-model.trim="profile.brand_preference" type="text" placeholder="丰田 / 本田 / 奔驰…" />
      </div>

      <div class="actions">
        <button class="primary" type="submit">保存信息</button>
        <button class="ghost" type="button" @click="goBack">返回</button>
        <button class="danger" type="button" @click="logout">退出登录</button>
      </div>

      <p v-if="message" class="message">{{ message }}</p>
    </form>
  </div>
</template>

<script>
export default {
  name: 'UserCenter',
  data() {
    return {
      profile: {
        name: '',
        mobile: '',
        budget: null,
        preferred_type: '',
        use_case: '',
        fuel_type: '',
        brand_preference: ''
      },
      message: ''
    };
  },
  mounted() {
    try {
      const v = localStorage.getItem('buycar_user_profile');
      if (v) this.profile = JSON.parse(v);
    } catch {}
  },
  methods: {
    validate() {
      if (!this.profile.name) {
        this.message = '请输入姓名';
        return false;
      }
      const mobileRe = /^1[3-9]\d{9}$/;
      if (!mobileRe.test(this.profile.mobile)) {
        this.message = '请输入正确的手机号';
        return false;
      }
      if (typeof this.profile.budget !== 'number' || this.profile.budget <= 0) {
        this.message = '请输入有效的预算（万元）';
        return false;
      }
      this.message = '';
      return true;
    },
    saveProfile() {
      if (!this.validate()) return;
      localStorage.setItem('buycar_user_profile', JSON.stringify(this.profile));
      this.message = '已保存';
      setTimeout(() => (this.message = ''), 1200);
    },
    goBack() {
      this.$router.back();
    },
    logout() {
      localStorage.removeItem('buycar_auth');
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.user-center { padding: 24px; max-width: 640px; margin: 0 auto; }
h2 { margin: 0 0 16px; }
.card { background: rgba(0, 17, 13, 0.6); border: 1px solid rgba(0,255,156,0.18); border-radius: 12px; padding: 20px; }
.field { margin-bottom: 14px; display: flex; flex-direction: column; }
label { font-size: 13px; color: var(--muted); margin-bottom: 6px; }
input { height: 40px; padding: 0 12px; border-radius: 8px; border: 1px solid rgba(148,163,184,0.18); background: rgba(0, 17, 13, 0.75); color: var(--text); }
.actions { display: flex; gap: 12px; margin-top: 6px; }
.primary { padding: 10px 16px; border: none; border-radius: 10px; background: linear-gradient(135deg, var(--neon), var(--neon-2)); color: #00110d; font-weight: 800; }
.ghost { padding: 10px 16px; border-radius: 10px; border: 1px solid rgba(148,163,184,0.25); background: transparent; color: var(--text); }
.danger { padding: 10px 16px; border: none; border-radius: 10px; background: #ff6b6b; color: white; font-weight: 800; }
.message { color: var(--muted); margin-top: 8px; }
</style>