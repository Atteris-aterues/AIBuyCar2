<template>
  <div class="score-page">
    <div class="header">
      <h1 class="title chroma">我的积分</h1>
      <div class="score-display">
        <span class="score-label">当前积分：</span>
        <span class="score-value">{{ userScore }}</span>
      </div>
    </div>

    <div class="tabs">
      <button 
        :class="['tab', { active: activeTab === 'gifts' }]"
        @click="activeTab = 'gifts'"
      >
        周边商城
      </button>
      <button 
        :class="['tab', { active: activeTab === 'history' }]"
        @click="activeTab = 'history'"
      >
        兑换记录
      </button>
    </div>

    <div class="content">
      <!-- 周边商城 -->
      <div v-if="activeTab === 'gifts'" class="gifts-section">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="gifts.length === 0" class="empty">暂无周边商品</div>
        <div v-else class="gifts-grid">
          <div 
            v-for="gift in gifts" 
            :key="gift.gift_id || gift.id"
            class="gift-card"
          >
            <div class="gift-name">{{ gift.name || '周边商品' }}</div>
            <div class="gift-description">{{ gift.description || '' }}</div>
            <div class="gift-footer">
              <span class="gift-score">{{ gift.score || 0 }} 积分</span>
              <button 
                class="btn-exchange"
                :disabled="userScore < (gift.score || 0) || exchanging"
                @click="exchangeGift(gift)"
              >
                {{ exchanging ? '兑换中...' : '兑换' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 兑换记录 -->
      <div v-if="activeTab === 'history'" class="history-section">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="exchangeHistory.length === 0" class="empty">暂无兑换记录</div>
        <div v-else class="history-list">
          <div 
            v-for="(item, index) in exchangeHistory" 
            :key="index"
            class="history-item"
          >
            <div class="history-name">{{ item.gift_name || '周边商品' }}</div>
            <div class="history-info">
              <span class="history-score">-{{ item.score || 0 }} 积分</span>
              <span class="history-time">{{ item.created_at || '' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { apiScoreUserQuery, apiGiftQuery, apiGiftPurchase } from '@/api'

export default {
  name: 'ScorePage',
  data() {
    return {
      activeTab: 'gifts',
      userScore: 0,
      gifts: [],
      exchangeHistory: [],
      loading: false,
      exchanging: false,
      errorMessage: ''
    }
  },
  created() {
    this.loadUserScore()
    this.loadGifts()
  },
  methods: {
    async loadUserScore() {
      this.loading = true
      try {
        const res = await apiScoreUserQuery()
        if (res && res.baseResponse && res.baseResponse.code === 10000) {
          this.userScore = res.score || 0
        } else {
          this.errorMessage = (res && res.baseResponse && res.baseResponse.message) || '获取积分失败'
        }
      } catch (e) {
        console.error('获取积分失败:', e)
        this.errorMessage = '获取积分失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    async loadGifts() {
      this.loading = true
      try {
        const res = await apiGiftQuery()
        if (res && res.baseResponse && res.baseResponse.code === 10000) {
          this.gifts = res.gifts || res.data || []
        } else {
          this.errorMessage = (res && res.baseResponse && res.baseResponse.message) || '获取商品列表失败'
        }
      } catch (e) {
        console.error('获取商品列表失败:', e)
        this.errorMessage = '获取商品列表失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    async exchangeGift(gift) {
      if (this.userScore < (gift.score || 0)) {
        this.errorMessage = '积分不足'
        return
      }
      this.exchanging = true
      this.errorMessage = ''
      try {
        const res = await apiGiftPurchase({ gitft_id: gift.gift_id || gift.id })
        if (res && res.baseResponse && res.baseResponse.code === 10000) {
          // 兑换成功，刷新积分和列表
          await this.loadUserScore()
          await this.loadGifts()
          alert('兑换成功！')
        } else {
          this.errorMessage = (res && res.baseResponse && res.baseResponse.message) || '兑换失败'
        }
      } catch (e) {
        console.error('兑换失败:', e)
        this.errorMessage = '兑换失败，请稍后重试'
      } finally {
        this.exchanging = false
      }
    }
  }
}
</script>

<style scoped>
.score-page {
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
  margin: 12px 0 16px;
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
.score-display {
  font-size: 24px;
  color: var(--text);
}
.score-label {
  color: var(--muted);
  margin-right: 8px;
}
.score-value {
  color: var(--neon);
  font-weight: 800;
}
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
.gifts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.gift-card {
  background: rgba(15,23,42,0.85);
  border: 1px solid rgba(148,163,184,0.18);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.gift-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,255,156,0.15);
}
.gift-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}
.gift-description {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 16px;
  min-height: 40px;
}
.gift-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.gift-score {
  color: var(--neon);
  font-weight: 700;
  font-size: 16px;
}
.btn-exchange {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, var(--neon), var(--neon-2));
  color: #00110d;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-exchange:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(15,23,42,0.85);
  border: 1px solid rgba(148,163,184,0.18);
  border-radius: 8px;
}
.history-name {
  color: var(--text);
  font-weight: 600;
}
.history-info {
  display: flex;
  gap: 16px;
  align-items: center;
}
.history-score {
  color: var(--error);
  font-weight: 700;
}
.history-time {
  color: var(--muted);
  font-size: 13px;
}
.error {
  margin-top: 16px;
  color: var(--error);
  text-align: center;
  font-size: 14px;
}
</style>



