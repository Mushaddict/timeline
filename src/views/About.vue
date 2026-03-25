<template>
  <div class="about">
    <div class="about-card">
      <h1>关于 Timeline</h1>
      <p>这是一个基于 Vue3 开发的时光轴应用，用于记录生活中的重要时刻和人物。</p>
      
      <h2>功能特点</h2>
      <ul>
        <li>垂直时间轴展示，支持滚动动画效果</li>
        <li>时间节点支持单点和区间两种类型</li>
        <li>每个节点可包含多个框架，支持文字和图片</li>
        <li>人物管理，自动根据生日计算星座</li>
        <li>按人物筛选时间轴事件</li>
        <li>纯静态部署，可托管在 GitHub Pages</li>
      </ul>
      
      <h2>技术栈</h2>
      <div class="tech-stack">
        <span class="tech-tag">Vue 3</span>
        <span class="tech-tag">TypeScript</span>
        <span class="tech-tag">Vite</span>
        <span class="tech-tag">Vue Router</span>
        <span class="tech-tag">Pinia</span>
        <span class="tech-tag">GSAP</span>
        <span class="tech-tag">date-fns</span>
      </div>
      
      <h2>使用说明</h2>
      <ol>
        <li>在"人物"页面添加你关心的人</li>
        <li>编辑 <code>public/data/timeline.json</code> 添加时间节点</li>
        <li>将图片放入 <code>public/uploads/</code> 目录</li>
        <li>提交并推送到 GitHub，自动部署到 GitHub Pages</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about {
  padding: 2rem 0;
}

.about-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.about-card h1 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.about-card h2 {
  color: #667eea;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-size: 1.3rem;
}

.about-card p {
  color: #666;
  line-height: 1.6;
}

.about-card ul,
.about-card ol {
  color: #666;
  line-height: 1.8;
  padding-left: 1.5rem;
}

.about-card li {
  margin-bottom: 0.5rem;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tech-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

code {
  background: #f4f4f4;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}
</style>
