// 简单的 Markdown 渲染工具（用于聊天消息格式化）
export function formatMarkdown(text) {
  if (!text) return ''
  
  // 转义 HTML
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // 代码块
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
  
  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
  
  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
  // 斜体
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  
  // 有序列表
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return '<ol>' + match + '</ol>'
  })
  
  // 无序列表
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    if (!match.includes('<ol>')) {
      return '<ul>' + match + '</ul>'
    }
    return match
  })
  
  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  
  // 换行
  html = html.replace(/\n/g, '<br>')
  
  return html
}



