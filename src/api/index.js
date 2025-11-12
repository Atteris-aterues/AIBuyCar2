import { http } from '../utils/http'

// 用户
export function apiLogin({ username, password }) {
  // 文档为 POST 且参数在 query
  return http.post('/api/user/login', { params: { username, password } })
}

export function apiRegister({ username, password }) {
  return http.post('/api/user/register', { params: { username, password } })
}

export function apiFeedback({ consult_id, content }) {
  return http.post('/api/user/feedback', { params: { consult_id, content } })
}

// 购车决策
export function apiConsultPurchase(params) {
  // params: { budget_range, preferred_type, use_case, fuel_type, brand_preference }
  return http.post('/api/consult/purchase', {
    data: params
  })
}

export function apiConsultQuery({ consult_id }) {
  return http.get('/api/consult/query', { params: { consult_id } })
}

// 积分模块
export function apiScoreUserQuery() {
  return http.get('/api/score/user/query')
}

export function apiGiftPurchase({ gitft_id }) {
  return http.post('/api/score/gift/purchase', { params: { gitft_id } })
}

export function apiGiftQuery() {
  return http.get('/api/score/gift/query')
}

// 管理员
export function apiAdminConsultQuery() {
  return http.get('/api/admin/consult/query')
}

export function apiAdminUserAdd({ id, password }) {
  return http.post('/api/admin/user/add', { params: { id, password } })
}

export function apiAdminUserDelete({ id }) {
  return http.del('/api/admin/user/delete', { params: { id } })
}

export function apiAdminFeedbackQuery() {
  return http.get('/api/admin/feedback/query')
}

// AI 对话接口
export function apiChatMessage({ message, history = [], meta = {} }) {
  // 发送用户消息和对话历史给 AI
  // 如果后端支持流式响应，可以后续扩展
  return http.post('/api/chat/message', {
    data: {
      message: message,
      history: history,
      meta,
      timestamp: Date.now()
    }
  })
}


