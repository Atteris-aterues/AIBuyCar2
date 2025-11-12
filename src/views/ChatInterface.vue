<!-- ChatInterface.vue -->
<template>
  <div class="chat-container">
    <!-- 聊天历史区域 -->
    <div class="chat-history" ref="chatHistory">
      <div 
        v-for="(message, index) in messages" 
        :key="message.id || index"
        :class="['message', message.sender, { 'is-loading': message.isLoading }]"
      >
        <div class="message-content" v-html="formatMessage(message.content)"></div>
        <div class="message-actions" v-if="message.sender === 'system' && !message.isLoading">
          <button @click="copyMessage(message.content)" class="action-btn" title="复制">
            📋
          </button>
          <button @click="feedbackMessage(message)" class="action-btn" title="反馈">
            💬
          </button>
        </div>
        <div class="timestamp">{{ message.timestamp }}</div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-wrapper">
        <textarea 
          ref="messageInput"
          class="input"
          v-model="userInput"
          placeholder="请输入您的购车需求或问题..."
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact.prevent="addNewLine"
          @input="adjustTextareaHeight"
        ></textarea>
        <div class="input-hint">Shift + Enter 换行 | Enter 发送</div>
      </div>
      <button 
        class="send-button" 
        @click="sendMessage"
        :disabled="!userInput.trim() || isLoading"
      >
        {{ isLoading ? '发送中...' : '发送' }}
      </button>
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
  </div>
</template>

<script>
import { formatMarkdown } from '@/utils/markdown'
import { getCurrentUser, getProfileKey } from '@/utils/auth'
import { apiConsultPurchase, apiFeedback, apiChatMessage } from '@/api'

export default {
  name: 'ChatInterface',
  data() {
    return {
      messages: [],
      userInput: '',
      currentConsultId: null, // 当前咨询记录 ID
      isLoading: false,
      showFeedbackDialog: false,
      feedbackContent: '',
      feedbackMessage: null,
      messageIdCounter: 0
    };
  },
  created() {
    this.loadChatHistory()
    // 如果没有历史记录，添加欢迎消息
    if (this.messages.length === 0) {
      this.messages.push({
        id: this.getMessageId(),
        sender: 'system',
        content: '您好！欢迎使用 AIBuyCar 购车咨询服务。\n\n我可以帮您：\n- 根据预算和需求推荐车型\n- 解答购车相关问题\n- 提供购车建议\n\n请告诉我您的购车需求，例如：\n"我想买一辆20万左右的SUV，主要用于家庭出行"',
        timestamp: this.getCurrentTime()
      })
      this.saveChatHistory()
    }
  },
  methods: {
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    },
    
    getMessageId() {
      return `msg_${Date.now()}_${++this.messageIdCounter}`
    },
    
    formatMessage(content) {
      return formatMarkdown(content)
    },
    
    loadChatHistory() {
      try {
        const user = getCurrentUser()
        const chatKey = `aibuycar_chat_${user?.userId || 'default'}`
        const saved = localStorage.getItem(chatKey)
        if (saved) {
          const history = JSON.parse(saved)
          this.messages = history.messages || []
          this.messageIdCounter = history.messageIdCounter || 0
          this.currentConsultId = history.currentConsultId || null
        }
      } catch (e) {
        console.error('加载聊天历史失败:', e)
      }
    },
    
    saveChatHistory() {
      try {
        const user = getCurrentUser()
        const chatKey = `aibuycar_chat_${user?.userId || 'default'}`
        const history = {
          messages: this.messages,
          messageIdCounter: this.messageIdCounter,
          currentConsultId: this.currentConsultId,
          lastUpdated: Date.now()
        }
        localStorage.setItem(chatKey, JSON.stringify(history))
      } catch (e) {
        console.error('保存聊天历史失败:', e)
      }
    },
    
    clearChatHistory() {
      if (confirm('确定要清空聊天记录吗？')) {
        this.messages = [{
          id: this.getMessageId(),
          sender: 'system',
          content: '聊天记录已清空。请告诉我您的购车需求。',
          timestamp: this.getCurrentTime()
        }]
        this.saveChatHistory()
      }
    },
    
    copyMessage(content) {
      const text = content.replace(/```[\s\S]*?```/g, '').replace(/`/g, '')
      navigator.clipboard.writeText(text).then(() => {
        // 可以显示一个提示
        const btn = event.target.closest('.action-btn')
        const original = btn.textContent
        btn.textContent = '✓'
        setTimeout(() => {
          btn.textContent = original
        }, 1000)
      }).catch(err => {
        console.error('复制失败:', err)
      })
    },
    
    feedbackMessage(message) {
      this.feedbackMessage = message
      this.feedbackContent = ''
      this.showFeedbackDialog = true
    },
    
    async submitFeedback() {
      if (!this.feedbackContent.trim()) return
      try {
        const res = await apiFeedback({
          consult_id: this.currentConsultId || '',
          content: this.feedbackContent
        })
        if (res && res.baseResponse && res.baseResponse.code === 10000) {
          alert('反馈提交成功，感谢您的反馈！')
          this.showFeedbackDialog = false
          this.feedbackContent = ''
        } else {
          alert('提交失败，请稍后重试')
        }
      } catch (e) {
        console.error('提交反馈失败:', e)
        alert('提交失败，请稍后重试')
      }
    },

    // 新增：调整文本框高度
    adjustTextareaHeight(event) {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    },

    // 新增：处理 Shift+Enter 换行
    addNewLine(event) {
      this.userInput += '\n';
      this.$nextTick(() => {
        this.adjustTextareaHeight({ target: this.$refs.messageInput });
      });
    },

    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;

      // 添加用户消息到聊天记录
      this.messages.push({
        id: this.getMessageId(),
        sender: 'user',
        content: this.userInput,
        timestamp: this.getCurrentTime()
      });
      this.saveChatHistory()

      // 保存用户输入以便后续处理
      const userQuery = this.userInput;
      this.userInput = '';
      
      // 重置输入框高度
      this.$nextTick(() => {
        if (this.$refs.messageInput) {
          this.$refs.messageInput.style.height = '44px';
        }
      });

      // 显示加载状态
      this.isLoading = true
      const loadingMsg = {
        id: this.getMessageId(),
        sender: 'system',
        content: '正在为您分析需求，请稍候...',
        timestamp: this.getCurrentTime(),
        isLoading: true
      }
      this.messages.push(loadingMsg)
      this.saveChatHistory()
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      // 调用购车咨询 API
      try {
        const response = await this.callLLMService(userQuery);
        
        // 移除加载消息
        const loadingIndex = this.messages.findIndex(m => m.isLoading)
        if (loadingIndex !== -1) {
          this.messages.splice(loadingIndex, 1)
        }
        
        // 添加系统回复到聊天记录
        this.messages.push({
          id: this.getMessageId(),
          sender: 'system',
          content: response,
          timestamp: this.getCurrentTime()
        });
        this.saveChatHistory()
        
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        // 移除加载消息
        const loadingIndex = this.messages.findIndex(m => m.isLoading)
        if (loadingIndex !== -1) {
          this.messages.splice(loadingIndex, 1)
        }
        
        this.messages.push({
          id: this.getMessageId(),
          sender: 'system',
          content: error.message || '抱歉，处理您的请求时出现错误，请稍后重试。',
          timestamp: this.getCurrentTime()
        });
        this.saveChatHistory()
      } finally {
        this.isLoading = false
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },

    
    async callLLMService(query) {
      try {
        const user = getCurrentUser()
        const profileKey = getProfileKey(user)
        let userProfile = {}
        try {
          const saved = localStorage.getItem(profileKey)
          if (saved) {
            userProfile = JSON.parse(saved)
          }
        } catch (e) {
          console.warn('解析用户偏好失败:', e)
        }

        // 从用户输入中解析偏好信息
        const extractedInfo = this.extractInfoFromQuery(query, userProfile)

        // 构建对话历史（只包含最近的对话，避免上下文过长）
        const recentHistory = this.buildConversationHistory()
          .map(item => ({
            role: item.role,
            content: item.content,
            metadata: {
              timestamp: item.timestamp,
              sender: item.sender
            }
          }))
        
        // 优先尝试调用 AI 对话接口
        try {
          console.log('[AI] 发送消息:', query)
          console.log('[AI] 对话历史:', recentHistory)
          
          const aiRes = await apiChatMessage({
            message: {
              text: query,
              preferences: extractedInfo,
              profile: userProfile,
              timestamp: Date.now()
            },
            history: recentHistory,
            meta: {
              userId: user?.userId || null,
              consultId: this.currentConsultId,
              locale: 'zh-CN'
            }
          })
          
          console.log('[AI] 收到响应:', aiRes)
          
          // 如果 AI 接口返回成功
          if (this.isSuccessResponse(aiRes)) {
            // 保存咨询记录 ID（如果返回）
            if (aiRes.consult_id) {
              this.currentConsultId = aiRes.consult_id
              this.saveChatHistory()
            }
            // 返回 AI 回复（支持多种可能的响应字段）
            const aiMessage = this.normalizeAIResponse(aiRes)
            if (aiMessage) {
              return aiMessage
            }
            // 如果没有找到消息字段，尝试直接返回整个响应（用于调试）
            console.warn('[AI] 响应格式异常，未找到消息字段:', aiRes)
            return '已收到您的消息，但响应格式异常，请查看控制台'
          } else {
            // 接口返回但 code 不是 10000
            const errorMsg = (aiRes && aiRes.baseResponse && aiRes.baseResponse.message) || 'AI 接口返回错误'
            console.warn('[AI] 接口返回错误:', errorMsg, aiRes)
            throw new Error(errorMsg)
          }
        } catch (aiError) {
          console.warn('[AI] 对话接口调用失败，降级到购车咨询接口:', aiError)
          // 如果 AI 接口不可用，降级到购车咨询接口
          // 继续执行降级逻辑
        }
        
        // 降级方案：使用购车咨询 API
        // 构建咨询参数
        const consultParams = {
          budget_range: extractedInfo.budget || userProfile.budget || '',
          preferred_type: extractedInfo.type || userProfile.bodyType || '',
          use_case: extractedInfo.purpose || userProfile.purpose || '',
          fuel_type: extractedInfo.fuel || userProfile.fuel || '',
          brand_preference: extractedInfo.brand || userProfile.brands || ''
        }
        
        // 调用购车咨询 API
        const res = await apiConsultPurchase(consultParams)
        
        // 处理响应
        if (this.isSuccessResponse(res)) {
          const consult = res.consult || res.data || {}
          // 保存咨询记录 ID（如果返回）
          if (consult.consult_id) {
            this.currentConsultId = consult.consult_id
            this.saveChatHistory()
          }
          if (res.consult_id && !this.currentConsultId) {
            this.currentConsultId = res.consult_id
            this.saveChatHistory()
          }
          // 格式化返回推荐结果
          return this.formatConsultResponse(consult)
        } else {
          const msg = (res && res.baseResponse && res.baseResponse.message) || '获取推荐失败'
          throw new Error(msg)
        }
      } catch (error) {
        console.error('API调用失败:', error)
        throw error
      }
    },
    
    // 构建对话历史（用于多轮对话上下文）
    buildConversationHistory() {
      // 只取最近的 10 轮对话（20 条消息），避免上下文过长
      const recentMessages = this.messages
        .filter(m => !m.isLoading && (m.sender === 'user' || m.sender === 'system'))
        .slice(-20)
      
      // 转换为 API 需要的格式
      return recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.timestamp,
        sender: msg.sender
      }))
    },
    
    // 从用户查询中提取信息（简单实现）
    extractInfoFromQuery(query, userProfile) {
      const info = {}
      
      // 提取预算（简单匹配）
      const budgetMatch = query.match(/(\d+)[万-]?(\d+)?[万]?/)
      if (budgetMatch) {
        const num = parseInt(budgetMatch[1])
        if (num < 10) info.budget = '10以下'
        else if (num < 20) info.budget = '10-20'
        else if (num < 30) info.budget = '20-30'
        else if (num < 50) info.budget = '30-50'
        else info.budget = '50以上'
      }
      
      // 提取车型
      if (query.includes('SUV') || query.includes('suv')) info.type = 'SUV'
      else if (query.includes('轿车')) info.type = '轿车'
      else if (query.includes('MPV') || query.includes('mpv')) info.type = 'MPV'
      else if (query.includes('跑车')) info.type = '跑车'
      
      // 提取用途
      if (query.includes('家庭') || query.includes('家用')) info.purpose = '家庭出行'
      else if (query.includes('通勤') || query.includes('代步')) info.purpose = '通勤代步'
      else if (query.includes('商务')) info.purpose = '商务接待'
      else if (query.includes('旅行') || query.includes('长途')) info.purpose = '长途旅行'
      
      // 提取燃料类型
      if (query.includes('纯电') || query.includes('电动')) info.fuel = '纯电'
      else if (query.includes('混动') || query.includes('混合')) info.fuel = '混动'
      else if (query.includes('插混')) info.fuel = '插混'
      
      return info
    },
    
    formatConsultResponse(consult) {
      if (!consult) return '暂未获取到推荐结果，请稍后重试。'

      const recommendations = this.parseRecommendations(consult.recommendations || consult.recommendation_list)
      const llmResponse = this.parseLLMResponse(consult.llm_response)

      if (recommendations.length > 0) {
        let result = '**根据您的需求，我为您推荐以下车型：**\n\n'
        recommendations.forEach((car, index) => {
          result += `**${index + 1}. ${car.name || car.model || '车型'}**\n`
          if (car.price) result += `   价格：${car.price}\n`
          if (car.brand) result += `   品牌：${car.brand}\n`
          if (car.type) result += `   车型：${car.type}\n`
          if (Array.isArray(car.features) && car.features.length) {
            result += `   亮点：${car.features.join('、')}\n`
          } else if (car.description) {
            result += `   特点：${car.description}\n`
          }
          if (car.reason) result += `   推荐理由：${car.reason}\n`
          result += '\n'
        })
        if (llmResponse) {
          result += `\n${llmResponse}\n`
        } else {
          result += '\n如需了解更多信息，请继续提问。'
        }
        return result.trim()
      }

      if (llmResponse) return llmResponse
      if (consult.message) return consult.message
      if (consult.summary) return consult.summary

      return '已收到您的需求，正在为您分析...'
    },

    normalizeAIResponse(res) {
      if (!res) return ''
      if (typeof res === 'string') return res
      if (typeof res.message === 'string') return res.message
      if (typeof res.response === 'string') return res.response
      if (typeof res.content === 'string') return res.content
      if (typeof res.data?.message === 'string') return res.data.message
      if (typeof res.data?.content === 'string') return res.data.content

      const payload = res.data || res.result || res.reply || res.output || {}

      if (typeof payload.text === 'string') return payload.text
      if (typeof payload.summary === 'string') return payload.summary
      if (payload.recommendations) {
        return this.formatConsultResponse(payload.consult || payload)
      }

      return ''
    },

    parseRecommendations(recommendations) {
      if (!recommendations) return []
      if (Array.isArray(recommendations)) return recommendations
      if (typeof recommendations === 'string') {
        try {
          const parsed = JSON.parse(recommendations)
          if (Array.isArray(parsed)) return parsed
          if (parsed && Array.isArray(parsed.recommendations)) return parsed.recommendations
        } catch (e) {
          const lines = recommendations.split(/\n+/).map(line => line.trim()).filter(Boolean)
          if (lines.length > 0) {
            return lines.map(line => ({ description: line }))
          }
        }
      }
      return []
    },

    parseLLMResponse(response) {
      if (!response) return ''
      if (typeof response === 'string') return response
      if (typeof response === 'object') {
        return response.text || response.message || response.content || ''
      }
      return ''
    },

    isSuccessResponse(res) {
      if (!res || !res.baseResponse) return false
      const code = res.baseResponse.code
      return code === 0 || code === 10000
    },

    scrollToBottom() {
      const container = this.$refs.chatHistory;
      container.scrollTop = container.scrollHeight;
    }
  },

  mounted() {
    this.scrollToBottom();
  }
};

</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
  background: radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.15), transparent 60%),
              radial-gradient(800px 400px at 100% 10%, rgba(16,185,129,0.1), transparent 60%);
  padding: 20px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  border-radius: 12px;
  background: rgba(2, 6, 23, 0.5);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(148,163,184,0.15);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04);
  margin-bottom: 20px;
  min-height: 0;
  max-height: calc(100vh - 240px);
}

.message {
  margin-bottom: 20px;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
}

.message.system {
  margin-right: auto;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-content :deep(strong) {
  font-weight: 700;
  color: inherit;
}

.message-content :deep(em) {
  font-style: italic;
}

.message-content :deep(code) {
  background: rgba(0,0,0,0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.message-content :deep(.code-block) {
  background: rgba(0,0,0,0.4);
  padding: 12px;
  border-radius: 8px;
  margin: 8px 0;
  overflow-x: auto;
  border: 1px solid rgba(148,163,184,0.2);
}

.message-content :deep(.code-block code) {
  background: transparent;
  padding: 0;
}

.message-content :deep(ul), .message-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.message-content :deep(li) {
  margin: 4px 0;
}

.message-content :deep(a) {
  color: var(--neon-2);
  text-decoration: underline;
}

.message-content :deep(a:hover) {
  color: var(--neon);
}

.message.is-loading .message-content {
  opacity: 0.7;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.4; }
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message:hover .message-actions {
  opacity: 1;
}

.action-btn {
  background: transparent;
  border: 1px solid rgba(148,163,184,0.3);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  color: var(--muted);
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(0,255,156,0.1);
  border-color: var(--neon);
  color: var(--neon);
}

.message.user .message-content {
  background: linear-gradient(135deg, #3b82f6, #22c55e);
  color: white;
  border-bottom-right-radius: 6px;
}

.message.system .message-content {
  background: rgba(15,23,42,0.85);
  color: #e5e7eb;
  border: 1px solid rgba(148,163,184,0.25);
  border-bottom-left-radius: 6px;
}

.timestamp {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 6px;
  text-align: right;
  padding-right: 6px;
}

.input-area {
  display: flex;
  padding: 0;
  background: transparent;
  border: none;
  gap: 12px;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(148,163,184,0.25);
  background: rgba(15,23,42,0.85);
  color: #e5e7eb;
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
  resize: none;
  min-height: 44px;
  max-height: 150px;
  font-family: inherit;
  line-height: 1.5;
}

.input::placeholder {
  color: #6b7280;
}

.input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.25);
  background: rgba(15,23,42,0.95);
}

.input-hint {
  position: absolute;
  right: 10px;
  bottom: 8px;
  font-size: 11px;
  color: #6b7280;
  pointer-events: none;
}

.send-button {
  padding: 0 24px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #22c55e);
  color: white;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: transform .08s ease, filter .2s ease, opacity .2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-end;
  height: 44px;
}

.send-button:hover:not(:disabled) {
  filter: brightness(1.1);
}

.send-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.send-button:active:not(:disabled) {
  transform: translateY(1px);
  filter: brightness(0.95);
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
  font-size: 18px;
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
  box-sizing: border-box;
}

.feedback-input:focus {
  border-color: var(--neon);
  box-shadow: 0 0 0 3px rgba(0,255,156,0.18);
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
  transition: all 0.2s;
}

.btn-cancel {
  background: transparent;
  color: var(--muted);
  border: 1px solid rgba(148,163,184,0.3);
}

.btn-cancel:hover {
  background: rgba(148,163,184,0.1);
}

.btn-submit {
  background: linear-gradient(135deg, var(--neon), var(--neon-2));
  color: #00110d;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit:not(:disabled):hover {
  filter: brightness(1.1);
}
</style>