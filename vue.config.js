const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        ws: false,
        // 如果后端不是以 /api 作为前缀，这里可以去掉前缀
        // pathRewrite: { '^/api': '' }
      }
    }
  }
})
