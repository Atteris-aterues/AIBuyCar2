# AIBuyCar - 一个更懂你的AI购车软件

基于 Vue.js 2.x 开发的智能购车咨询系统，集成 AI 对话功能，为用户提供个性化的购车推荐服务。

## 📋 项目简介

AIBuyCar 是一个现代化的购车咨询平台，采用赛博朋克/终端美学设计风格，提供以下核心功能：

- 用户注册/登录系统
- AI 智能购车咨询（集成 DeepSeek AI）
- 个性化偏好采集
- 多轮对话上下文支持
- 咨询记录查询
- 积分系统与周边商城
- 管理员后台管理

## 🛠️ 运行环境要求

### 必需环境

- **Node.js**: ≥ 14.x（推荐 16.x 或 18.x）
- **npm**: ≥ 6.x（或使用 yarn）
- **操作系统**: Windows 10+ / macOS / Linux

### 浏览器支持

- Chrome/Edge (推荐)
- Firefox
- Safari
- 其他现代浏览器

## 📦 安装步骤

### 1. 克隆项目（如果从 Git 仓库）

```bash
git clone <repository-url>
cd vue
```

### 2. 安装依赖

```bash
npm install
```

或使用 yarn：

```bash
yarn install
```

### 3. 配置后端服务

确保后端服务运行在 `http://localhost:8888`，前端会自动通过代理转发 API 请求。

如需修改后端地址，请编辑 `vue.config.js` 中的代理配置：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8888',  // 修改为实际后端地址
    changeOrigin: true
  }
}
```

## 🚀 运行项目

### 开发模式

```bash
npm run dev
```

或

```bash
npm run serve
```

开发服务器将在 `http://localhost:8081` 启动。

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录，可直接部署到静态文件服务器。
