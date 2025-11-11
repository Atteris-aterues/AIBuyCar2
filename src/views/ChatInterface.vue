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
          :placeholder="currentQuestion.placeholder"
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
      messages: [],
      userInput: '',
      // 存储用户购车需求的数据对象
      carRequirements: {
        brand_preference: '',   // 品牌偏好
        budget_range: '',       // 预算范围
        fuel_type: '',          // 燃料材料偏好
        preferred_type: '',     // 偏好车型
        use_case: ''            // 主要使用场景
      },
      // 当前询问的问题索引
      currentQuestionIndex: 0,
      // 定义问题序列
      questions: [
        {
          key: 'budget_range',
          text: '请问您的购车预算范围是多少？（例如：10-15万、20万以上等）',
          placeholder: '请输入您的预算范围...'
        },
        {
          key: 'brand_preference',
          text: '您有特别偏好的汽车品牌吗？（例如：丰田、本田、奔驰等）',
          placeholder: '请输入您偏好的品牌...'
        },
        {
          key: 'fuel_type',
          text: '您倾向于哪种燃料类型的车辆？（例如：汽油、柴油、纯电动、混动等）',
          placeholder: '请输入您偏好的燃料类型...'
        },
        {
          key: 'preferred_type',
          text: '您更喜欢哪种类型的车型？（例如：轿车、SUV、MPV、跑车等）',
          placeholder: '请输入您偏好的车型...'
        },
        {
          key: 'use_case',
          text: '您的主要使用场景是什么？（例如：日常通勤、家庭出行、商务用车等）',
          placeholder: '请输入您的主要使用场景...'
        }
      ]
    };
  },
  computed: {
    // 计算当前问题
    currentQuestion() {
      if (this.currentQuestionIndex < this.questions.length) {
        return this.questions[this.currentQuestionIndex];
      }
      return { text: '感谢您提供的信息，正在为您推荐合适的车型...', placeholder: '请输入...' };
    },
    // 检查是否已完成所有问题
    isQuestionnaireComplete() {
      return this.currentQuestionIndex >= this.questions.length;
    }
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

      if (!this.isQuestionnaireComplete) {
        // 保存用户回答到对应字段
        const currentKey = this.currentQuestion.key;
        this.carRequirements[currentKey] = this.userInput.trim();
        
        // 移动到下一个问题
        this.currentQuestionIndex++;
        
        // 如果还有问题，提出下一个问题
        if (this.currentQuestionIndex < this.questions.length) {
          this.messages.push({
            sender: 'system',
            content: this.currentQuestion.text,
            timestamp: this.getCurrentTime()
          });
        } else {
          // 所有问题都已回答，生成推荐
          this.generateRecommendation();
        }
      } else {
        // 问卷已完成，处理后续对话
        await this.handleFollowUpConversation();
      }

      // 清空输入框
      this.userInput = '';
      
      // 重置输入框高度
      this.$nextTick(() => {
        if (this.$refs.messageInput) {
          this.$refs.messageInput.style.height = '44px';
        }
      });

      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    // 生成推荐结果
    async generateRecommendation() {
      // 显示收集到的信息
      let summary = '感谢您提供的信息，您当前的购车需求如下：\n';
      summary += `预算范围：${this.carRequirements.budget_range || '未提供'}\n`;
      summary += `品牌偏好：${this.carRequirements.brand_preference || '未提供'}\n`;
      summary += `燃料类型：${this.carRequirements.fuel_type || '未提供'}\n`;
      summary += `偏好车型：${this.carRequirements.preferred_type || '未提供'}\n`;
      summary += `使用场景：${this.carRequirements.use_case || '未提供'}\n\n`;
      summary += '正在为您推荐合适的车型...';

      this.messages.push({
        sender: 'system',
        content: summary,
        timestamp: this.getCurrentTime()
      });

      // 模拟调用推荐服务
      try {
        const response = await this.callRecommendationService(this.carRequirements);
        
        // 添加推荐结果到聊天记录
        this.messages.push({
          sender: 'system',
          content: response,
          timestamp: this.getCurrentTime()
        });
      } catch (error) {
        this.messages.push({
          sender: 'system',
          content: '抱歉，生成推荐时出现错误，请稍后重试。',
          timestamp: this.getCurrentTime()
        });
      }
    },

    // 处理后续对话
    async handleFollowUpConversation() {
      try {
        const response = await this.callLLMService(this.userInput);
        
        // 添加系统回复到聊天记录
        this.messages.push({
          sender: 'system',
          content: response,
          timestamp: this.getCurrentTime()
        });
      } catch (error) {
        this.messages.push({
          sender: 'system',
          content: '抱歉，处理您的请求时出现错误，请稍后重试。',
          timestamp: this.getCurrentTime()
        });
      }
    },

    // 调用推荐服务
    async callRecommendationService(requirements) {
      // 这里应该实际调用推荐API
      // 暂时返回模拟数据
      return `根据您的需求，我们为您推荐以下车型：
1. 丰田卡罗拉 - 经济实用，适合城市通勤
2. 本田思域 - 动力强劲，外观时尚
3. 大众朗逸 - 空间宽敞，适合家庭使用
      
您可以进一步说明您的具体需求，我会为您提供更精准的推荐。`;
    },

    // 调用LLM服务
    async callLLMService(query) {
      // 这里应该实际调用 LLMService.callAPI()
      // 暂时返回模拟数据
      return `感谢您的提问。基于您之前提供的购车需求，我可以为您提供更多相关信息。请问您还想了解哪些方面？`;
    },

    scrollToBottom() {
      const container = this.$refs.chatHistory;
      container.scrollTop = container.scrollHeight;
    }
  },

  mounted() {
    // 初始化时提出第一个问题
    this.messages.push({
      sender: 'system',
      content: '您好！欢迎使用购车咨询服务。为了更好地为您推荐合适的车型，我需要了解一些您的购车需求。',
      timestamp: this.getCurrentTime()
    });
    
    this.messages.push({
      sender: 'system',
      content: this.currentQuestion.text,
      timestamp: this.getCurrentTime()
    });
    
    this.$nextTick(() => {
      this.scrollToBottom();
    });
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