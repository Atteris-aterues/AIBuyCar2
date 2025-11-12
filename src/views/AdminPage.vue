<template>
  <div class="admin-page">
    <div class="header">
      <h1 class="title chroma">管理员面板</h1>
    </div>

    <div class="tabs">
      <button 
        :class="['tab', { active: activeTab === 'consults' }]"
        @click="activeTab = 'consults'"
      >
        咨询记录
      </button>
      <button 
        :class="['tab', { active: activeTab === 'users' }]"
        @click="activeTab = 'users'"
      >
        用户管理
      </button>
      <button 
        :class="['tab', { active: activeTab === 'feedback' }]"
        @click="activeTab = 'feedback'"
      >
        反馈分析
      </button>
    </div>

    <div class="content">
      <!-- 咨询记录 -->
      <div v-if="activeTab === 'consults'" class="section">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="consults.length === 0" class="empty">暂无咨询记录</div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>咨询ID</th>
                <th>用户</th>
                <th>预算</th>
                <th>车型</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="consult in consults" :key="consult.consult_id">
                <td>{{ consult.consult_id }}</td>
                <td>{{ consult.username || consult.user_id }}</td>
                <td>{{ consult.budget_range || '-' }}</td>
                <td>{{ consult.preferred_type || '-' }}</td>
                <td>{{ formatTime(consult.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 用户管理 -->
      <div v-if="activeTab === 'users'" class="section">
        <div class="user-actions">
          <button class="btn-add" @click="showAddUser = true">添加用户</button>
        </div>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>用户ID</th>
                <th>用户名</th>
                <th>积分</th>
                <th>是否管理员</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.user_id">
                <td>{{ user.user_id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.score || 0 }}</td>
                <td>{{ user.is_admin ? '是' : '否' }}</td>
                <td>
                  <button 
                    class="btn-delete"
                    @click="deleteUser(user.user_id)"
                    :disabled="deleting"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 反馈分析 -->
      <div v-if="activeTab === 'feedback'" class="section">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="feedbacks.length === 0" class="empty">暂无反馈数据</div>
        <div v-else class="feedback-list">
          <div 
            v-for="(fb, index) in feedbacks" 
            :key="index"
            class="feedback-item"
          >
            <div class="feedback-header">
              <span>咨询ID: {{ fb.consult_id || '-' }}</span>
              <span class="feedback-time">{{ formatTime(fb.created_at) }}</span>
            </div>
            <div class="feedback-content-text">{{ fb.content || '-' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加用户对话框 -->
    <div v-if="showAddUser" class="dialog" @click.self="showAddUser = false">
      <div class="dialog-content">
        <h3>添加用户</h3>
        <div class="form-group">
          <label>用户ID</label>
          <input v-model="newUser.id" type="text" class="input" placeholder="输入用户ID">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="newUser.password" type="password" class="input" placeholder="输入密码">
        </div>
        <div class="dialog-actions">
          <button @click="showAddUser = false" class="btn-cancel">取消</button>
          <button @click="addUser" class="btn-submit" :disabled="!newUser.id || !newUser.password">
            添加
          </button>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { apiAdminConsultQuery, apiAdminUserAdd, apiAdminUserDelete, apiAdminFeedbackQuery } from '@/api'

export default {
  name: 'AdminPage',
  data() {
    return {
      activeTab: 'consults',
      consults: [],
      users: [],
      feedbacks: [],
      loading: false,
      deleting: false,
      errorMessage: '',
      showAddUser: false,
      newUser: {
        id: '',
        password: ''
      }
    }
  },
  created() {
    this.loadConsults()
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'consults') {
        this.loadConsults()
      } else if (newTab === 'feedback') {
        this.loadFeedbacks()
      }
    }
  },
  methods: {
    async loadConsults() {
      this.loading = true
      try {
        const res = await apiAdminConsultQuery()
        if (res && res.baseResponse && res.baseResponse.code === 10000) {
          this.consults = res.consults || res.data || []
        } else {
          this.errorMessage = (res && res.baseResponse && res.baseResponse.message) || '获取记录失败'
        }
      } catch (e) {
        console.error('获取咨询记录失败:', e)
        this.errorMessage = '获取咨询记录失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    async loadFeedbacks() {
      this.loading = true
      try {
        const res = await apiAdminFeedbackQuery()
        if (res && res.baseResponse && res.baseResponse.code === 10000) {
          this.feedbacks = res.feedbacks || res.data || []
        } else {
          this.errorMessage = (res && res.baseResponse && res.baseResponse.message) || '获取反馈失败'
        }
      } catch (e) {
        console.error('获取反馈失败:', e)
        this.errorMessage = '获取反馈失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    async addUser() {
      if (!this.newUser.id || !this.newUser.password) return
      try {
        const res = await apiAdminUserAdd({
          id: this.newUser.id,
          password: this.newUser.password
        })
        if (res && res.baseResponse && res.baseResponse.code === 10000) {
          alert('用户添加成功！')
          this.showAddUser = false
          this.newUser = { id: '', password: '' }
        } else {
          this.errorMessage = (res && res.baseResponse && res.baseResponse.message) || '添加失败'
        }
      } catch (e) {
        console.error('添加用户失败:', e)
        this.errorMessage = '添加用户失败，请稍后重试'
      }
    },
    async deleteUser(userId) {
      if (!confirm('确定要删除该用户吗？')) return
      this.deleting = true
      try {
        const res = await apiAdminUserDelete({ id: userId })
        if (res && res.baseResponse && res.baseResponse.code === 10000) {
          alert('用户删除成功！')
          // 刷新列表
        } else {
          this.errorMessage = (res && res.baseResponse && res.baseResponse.message) || '删除失败'
        }
      } catch (e) {
        console.error('删除用户失败:', e)
        this.errorMessage = '删除用户失败，请稍后重试'
      } finally {
        this.deleting = false
      }
    },
    formatTime(timeStr) {
      if (!timeStr) return '-'
      try {
        const date = new Date(timeStr)
        return date.toLocaleString('zh-CN')
      } catch (e) {
        return timeStr
      }
    }
  }
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: radial-gradient(1200px 600px at 50% -10%, rgba(0,255,156,0.15), transparent 60%),
              radial-gradient(800px 400px at 100% 10%, rgba(56,189,248,0.12), transparent 60%);
}
.header {
  text-align: center;
  margin-bottom: 32px;
}
.title {
  margin: 12px 0;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 0.5px;
  color: var(--text);
}
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
.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(148,163,184,0.2);
}
.tab {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.tab:hover {
  color: var(--text);
}
.tab.active {
  color: var(--neon);
  border-bottom-color: var(--neon);
}
.content {
  background: rgba(0, 17, 13, 0.6);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,255,156,0.18);
  border-radius: 12px;
  padding: 24px;
  min-height: 400px;
}
.loading, .empty {
  text-align: center;
  padding: 40px;
  color: var(--muted);
}
.user-actions {
  margin-bottom: 16px;
}
.btn-add {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, var(--neon), var(--neon-2));
  color: #00110d;
  font-weight: 700;
  cursor: pointer;
}
.table-container {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(148,163,184,0.18);
}
.data-table th {
  color: var(--neon);
  font-weight: 700;
  background: rgba(0,255,156,0.1);
}
.data-table td {
  color: var(--text);
}
.btn-delete {
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid var(--error);
  background: transparent;
  color: var(--error);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.btn-delete:hover:not(:disabled) {
  background: var(--error);
  color: white;
}
.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.feedback-item {
  background: rgba(15,23,42,0.85);
  border: 1px solid rgba(148,163,184,0.18);
  border-radius: 8px;
  padding: 16px;
}
.feedback-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--text);
  font-weight: 600;
}
.feedback-time {
  color: var(--muted);
  font-size: 13px;
  font-weight: normal;
}
.feedback-content-text {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.dialog-content {
  background: rgba(0, 17, 13, 0.95);
  border: 1px solid rgba(0,255,156,0.3);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
}
.dialog-content h3 {
  color: var(--text);
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  color: var(--muted);
  margin-bottom: 6px;
  font-size: 13px;
}
.form-group .input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(148,163,184,0.18);
  background: rgba(15,23,42,0.85);
  color: var(--text);
  outline: none;
  box-sizing: border-box;
}
.form-group .input:focus {
  border-color: var(--neon);
  box-shadow: 0 0 0 3px rgba(0,255,156,0.18);
}
.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}
.btn-cancel, .btn-submit {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
}
.btn-cancel {
  background: transparent;
  color: var(--muted);
  border: 1px solid rgba(148,163,184,0.3);
}
.btn-submit {
  background: linear-gradient(135deg, var(--neon), var(--neon-2));
  color: #00110d;
}
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.error {
  margin-top: 16px;
  color: var(--error);
  text-align: center;
  font-size: 14px;
}
</style>



