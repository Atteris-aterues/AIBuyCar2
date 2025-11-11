<!-- ChatInterface.vue -->
<template>
  <div class="chat-container">
    <!-- 聊天历史区域 -->
    <div class="chat-history" ref="chatHistory">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        :class="['message', message.sender]"
      >
        <div class="message-content">{{ message.content }}</div>
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
          placeholder="请输入您的购车需求..."
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact.prevent="addNewLine"
          @input="adjustTextareaHeight"
        ></textarea>
        <div class="input-hint">Shift + Enter 换行</div>
      </div>
      <button 
        class="send-button" 
        @click="sendMessage"
        :disabled="!userInput.trim()"
      >
        发送
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatInterface',
  data() {
    return {
      messages: [
        {
          sender: 'system',
          content: '您好！欢迎使用购车咨询服务。请告诉我您的预算范围、车型偏好、使用场景等信息。',
          timestamp: this.getCurrentTime()
        }
      ],
      userInput: ''
    };
  },
  methods: {
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
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
      if (!this.userInput.trim()) return;

      // 添加用户消息到聊天记录
      this.messages.push({
        sender: 'user',
        content: this.userInput,
        timestamp: this.getCurrentTime()
      });

      // 保存用户输入以便后续处理
      const userQuery = this.userInput;
      this.userInput = '';
      
      // 重置输入框高度
      this.$nextTick(() => {
        if (this.$refs.messageInput) {
          this.$refs.messageInput.style.height = '44px';
        }
      });

      // 模拟调用 LLM 服务获取推荐结果
      try {
        const response = await this.callLLMService(userQuery);
        
        // 添加系统回复到聊天记录
        this.messages.push({
          sender: 'system',
          content: response,
          timestamp: this.getCurrentTime()
        });
        
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        this.messages.push({
          sender: 'system',
          content: '抱歉，处理您的请求时出现错误，请稍后重试。',
          timestamp: this.getCurrentTime()
        });
      }
    },

    
    async callLLMService(query) {
      // 这里应该实际调用 LLMService.callAPI()
      // 暂时返回模拟数据
      return `根据您的需求，我们为您推荐以下车型：
1. 丰田卡罗拉 - 经济实用，适合城市通勤
2. 本田思域 - 动力强劲，外观时尚
3. 大众朗逸 - 空间宽敞，适合家庭使用`;
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
  height: 100vh;
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
  line-height: 1.5;
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
</style>