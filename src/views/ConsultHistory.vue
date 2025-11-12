<template>
  <div class="consult-history-page">
    <div class="header">
      <h1 class="title chroma">咨询记录</h1>
    </div>

    <div class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="consultList.length === 0" class="empty">暂无咨询记录</div>
      <div v-else class="consult-list">
        <div 
          v-for="consult in consultList" 
          :key="consult.consult_id || consult.id"
          class="consult-card"
          @click="viewConsultDetail(consult)"
        >
          <div class="consult-header">
            <span class="consult-id">咨询 #{{ consult.consult_id || consult.id }}</span>
            <span class="consult-time">{{ formatTime(consult.created_at) }}</span>
          </div>
          <div class="consult-content">
            <div class="consult-params">
              <span v-if="consult.budget_range" class="param">预算：{{ consult.budget_range }}</span>
              <span v-if="consult.preferred_type" class="param">车型：{{ consult.preferred_type }}</span>
              <span v-if="consult.fuel_type" class="param">燃料：{{ consult.fuel_type }}</span>
            </div>
            <div v-if="consult.recommendations" class="consult-result">
              推荐结果：{{ consult.recommendations.length || 0 }} 个车型
            </div>
          </div>
          <button class="btn-feedback" @click.stop="showFeedback(consult)">
            反馈
          </button>
        </div>
      </div>
    </div>

    <!-- 反馈对话框 -->
    <div v-if="showFeedbackDialog" class="feedback-dialog" @click.self="showFeedbackDialog = false">
      <div class="feedback-content">
        <h3>提交反馈</h3>
        <textarea 
          v-model="feedbackContent" 
          placeholder="请输入您的反馈意见..."
          class="feedback-input"
        ></textarea>
        <div class="feedback-actions">
          <button @click="showFeedbackDialog = false" class="btn-cancel">取消</button>
          <button @click="submitFeedback" class="btn-submit" :disabled="!feedbackContent.trim()">
            提交
          </button>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { apiConsultQuery, apiFeedback } from '@/api'

export default {
  name: 'ConsultHistory',
  data() {
    return {
      consultList: [],
      loading: false,
      errorMessage: '',
      showFeedbackDialog: false,
      currentConsult: null,
      feedbackContent: ''
    }
  },
  created() {
    this.loadConsultHistory()
  },
  methods: {
    async loadConsultHistory() {
      this.loading = true
      try {
        // 这里应该调用获取所有咨询记录的接口
        // 由于 api.md 中没有列出用户查询所有记录的接口，这里先模拟
        // 实际应该从后端获取用户的咨询记录列表
        const res = await apiConsultQuery({ consult_id: '' })
        if (res && res.baseResponse && res.baseResponse.code === 10000) {
          this.consultList = res.consults || res.data || []
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
    viewConsultDetail(consult) {
      // 查看咨询详情
      this.$router.push({ 
        name: 'consult-detail', 
        params: { id: consult.consult_id || consult.id } 
      })
    },
    showFeedback(consult) {
      this.currentConsult = consult
      this.feedbackContent = ''
      this.showFeedbackDialog = true
    },
    async submitFeedback() {
      if (!this.feedbackContent.trim()) return
      try {
        const res = await apiFeedback({
          consult_id: this.currentConsult.consult_id || this.currentConsult.id,
          content: this.feedbackContent
        })
        if (res && res.baseResponse && res.baseResponse.code === 10000) {
          alert('反馈提交成功！')
          this.showFeedbackDialog = false
          this.feedbackContent = ''
        } else {
          this.errorMessage = (res && res.baseResponse && res.baseResponse.message) || '提交失败'
        }
      } catch (e) {
        console.error('提交反馈失败:', e)
        this.errorMessage = '提交反馈失败，请稍后重试'
      }
    },
    formatTime(timeStr) {
      if (!timeStr) return ''
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
.consult-history-page {
  min-height: 100vh;
  padding: 24px;
  max-width: 1200px;
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
.consult-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.consult-card {
  background: rgba(15,23,42,0.85);
  border: 1px solid rgba(148,163,184,0.18);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}
.consult-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,255,156,0.15);
}
.consult-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.consult-id {
  color: var(--neon);
  font-weight: 700;
  font-size: 16px;
}
.consult-time {
  color: var(--muted);
  font-size: 13px;
}
.consult-content {
  margin-bottom: 12px;
}
.consult-params {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.param {
  color: var(--text);
  font-size: 14px;
  padding: 4px 12px;
  background: rgba(0,255,156,0.1);
  border-radius: 6px;
}
.consult-result {
  color: var(--muted);
  font-size: 13px;
}
.btn-feedback {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid var(--neon);
  background: transparent;
  color: var(--neon);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.btn-feedback:hover {
  background: var(--neon);
  color: #00110d;
}
.feedback-dialog {
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
.feedback-content {
  background: rgba(0, 17, 13, 0.95);
  border: 1px solid rgba(0,255,156,0.3);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
}
.feedback-content h3 {
  color: var(--text);
  margin-bottom: 16px;
}
.feedback-input {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(148,163,184,0.18);
  background: rgba(15,23,42,0.85);
  color: var(--text);
  outline: none;
  resize: vertical;
  margin-bottom: 16px;
  font-family: inherit;
}
.feedback-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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




