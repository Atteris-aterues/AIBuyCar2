// Minimal HTTP client built on fetch with auth token and JSON handling
import { getToken } from './auth'

const defaultConfig = {
  baseURL: process.env.VUE_APP_API_BASE || '',
  timeoutMs: 60000 // 增加到 60 秒
}

function withBase(url) {
  if (!defaultConfig.baseURL) return url
  if (url.startsWith('http')) return url
  return defaultConfig.baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '')
}

function buildQuery(params) {
  if (!params) return ''
  const usp = new URLSearchParams()
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      value.forEach(v => usp.append(key, v))
    } else {
      usp.set(key, value)
    }
  })
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

async function request(method, url, { params, data, headers } = {}) {
  const controller = new AbortController()
  let timeout = null
  try {
    timeout = setTimeout(() => {
      controller.abort()
    }, defaultConfig.timeoutMs)
    
    const token = getToken()
    const finalHeaders = Object.assign({}, headers || {})
    // Only set JSON content-type when sending a body
    if (data && !finalHeaders['Content-Type']) {
      finalHeaders['Content-Type'] = 'application/json'
    }
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`
    }
    const fullUrl = withBase(url) + buildQuery(params)
    console.log(`[HTTP] ${method} ${fullUrl}`, { params, data })
    
    const resp = await fetch(fullUrl, {
      method,
      headers: finalHeaders,
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
      credentials: 'include'
    })
    
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    
    const contentType = resp.headers.get('content-type') || ''
    let payload = null
    if (contentType.includes('application/json')) {
      payload = await resp.json().catch(() => ({}))
    } else {
      payload = await resp.text().catch(() => '')
    }
    
    if (!resp.ok) {
      const error = new Error((payload && payload.message) || `HTTP ${resp.status}`)
      error.status = resp.status
      error.data = payload
      throw error
    }
    
    return payload
  } catch (err) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    // 处理 AbortError（超时或取消）
    if (err.name === 'AbortError' || err.message.includes('aborted')) {
      console.error(`[HTTP] 请求超时: ${method} ${url}`)
      const timeoutError = new Error('请求超时，请检查后端服务是否正常运行')
      timeoutError.name = 'TimeoutError'
      throw timeoutError
    }
    console.error(`[HTTP] 请求失败: ${method} ${url}`, err)
    throw err
  }
}

export const http = {
  get: (url, opts) => request('GET', url, opts),
  post: (url, opts) => request('POST', url, opts),
  put: (url, opts) => request('PUT', url, opts),
  del: (url, opts) => request('DELETE', url, opts)
}



