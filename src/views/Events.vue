<template>
  <div class="events-page">
    <div class="page-header">
      <h1>事件管理</h1>
      <div class="header-actions">
        <button
          v-if="isLocalDev"
          class="save-btn"
          :class="{ 'saving': saving }"
          @click="saveToFile"
          :disabled="saving"
        >
          <span v-if="saving">💾 保存中...</span>
          <span v-else>💾 保存到文件</span>
        </button>
        <button class="add-btn" @click="showForm = true">+ 添加事件</button>
      </div>
    </div>

    <!-- 保存状态消息 -->
    <div v-if="saveMessage" class="save-message" :class="{ 'success': saveMessage.includes('✅'), 'error': saveMessage.includes('❌') }">
      {{ saveMessage }}
    </div>

    <!-- 本地开发提示 -->
    <div v-if="isLocalDev" class="dev-notice">
      <span class="dot"></span>
      本地开发模式 - 修改后点击"保存到文件"可将数据写入 timeline.json
    </div>
    <div v-else class="prod-notice">
      <span class="dot gray"></span>
      生产模式 - 数据仅保存在内存中，刷新页面后恢复
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="events-list">
      <div
        v-for="node in sortedNodes"
        :key="node.id"
        class="event-card"
        @click="editNode(node)"
      >
        <div class="event-date">
          <div class="date-badge" :class="{ 'range': node.endDate, 'allday': node.isAllDay }">
            <span class="day">{{ formatDay(node.date) }}</span>
            <span class="month">{{ formatMonth(node.date) }}</span>
            <span v-if="node.isAllDay" class="allday-tag">全天</span>
          </div>
        </div>

        <div class="event-content">
          <h3 class="event-title">{{ node.title }}</h3>
          <p class="event-happened">{{ node.happened }}</p>

          <div class="event-meta">
            <span v-if="node.endDate" class="meta-tag range">
              {{ formatDateRange(node.date, node.endDate) }}
            </span>
            <span v-if="node.thought" class="meta-tag thought">💭 有想法</span>
            <span v-if="node.note" class="meta-tag note">📝 有备注</span>
          </div>
        </div>

        <div class="event-actions" @click.stop>
          <button class="edit-btn" @click="editNode(node)">编辑</button>
          <button class="delete-btn" @click="deleteNodeById(node.id)">删除</button>
        </div>
      </div>
    </div>

    <div v-if="nodes.length === 0 && !loading" class="empty">
      还没有添加任何事件，点击上方按钮添加
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal modal-large">
        <h2>{{ editingId ? '编辑事件' : '添加事件' }}</h2>
        <form @submit.prevent="saveNode">
          <!-- 时间设置 -->
          <div class="form-section">
            <h3>时间设置</h3>

            <div class="form-row">
              <div class="form-group">
                <label>开始日期 *</label>
                <input v-model="form.date" type="date" required />
              </div>

              <div class="form-group">
                <label>结束日期</label>
                <input v-model="form.endDate" type="date" />
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label" :class="{ 'disabled': form.endDate }">
                <input
                  type="checkbox"
                  v-model="form.isAllDay"
                  :disabled="!!form.endDate"
                  @change="onAllDayChange"
                />
                <span>全天事件（不能与结束时间同时选择）</span>
              </label>
            </div>

            <p v-if="form.isAllDay" class="form-hint">
              全天事件自动持续一整天，无需设置结束时间
            </p>
          </div>

          <!-- 基本信息 -->
          <div class="form-section">
            <h3>基本信息</h3>

            <div class="form-group">
              <label>事件标题 *</label>
              <input v-model="form.title" required placeholder="给这个事件起个名字" />
            </div>

            <div class="form-group">
              <label>发生了什么事 *</label>
              <textarea
                v-model="form.happened"
                rows="4"
                required
                placeholder="描述发生了什么..."
              ></textarea>
            </div>
          </div>

          <!-- 想法与备注 -->
          <div class="form-section">
            <h3>想法与备注</h3>

            <div class="form-group">
              <label>想法</label>
              <textarea
                v-model="form.thought"
                rows="3"
                placeholder="对这个事件有什么想法或感受..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>备注</label>
              <textarea
                v-model="form.note"
                rows="2"
                placeholder="其他需要记录的信息..."
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeForm">取消</button>
            <button type="submit" class="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useTimeline, type TimelineNode } from '../composables/useTimeline'
import { format, parseISO, isValid } from 'date-fns'

// 监听结束日期变化，如果有值则取消全天
watch(() => form.endDate, (newVal) => {
  if (newVal) {
    form.isAllDay = false
  }
})

const onAllDayChange = () => {
  if (form.isAllDay) {
    form.endDate = ''
  }
}

const {
  nodes,
  loading,
  saving,
  saveMessage,
  sortedNodes,
  fetchNodes,
  saveNodes,
  addNode,
  updateNode,
  deleteNode,
  formatDateRange
} = useTimeline()

const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  date: '',
  endDate: '',
  isAllDay: false,
  title: '',
  happened: '',
  thought: '',
  note: ''
})

const isLocalDev = computed(() => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
})

onMounted(() => {
  fetchNodes()
})

const closeForm = () => {
  showForm.value = false
  editingId.value = null
  form.date = ''
  form.endDate = ''
  form.isAllDay = false
  form.title = ''
  form.happened = ''
  form.thought = ''
  form.note = ''
}

const formatDay = (dateStr: string): string => {
  const date = parseISO(dateStr)
  return isValid(date) ? format(date, 'dd') : ''
}

const formatMonth = (dateStr: string): string => {
  const date = parseISO(dateStr)
  return isValid(date) ? format(date, 'MM月') : ''
}

const editNode = (node: TimelineNode) => {
  editingId.value = node.id
  form.date = node.date
  form.endDate = node.endDate || ''
  form.isAllDay = node.isAllDay || false
  form.title = node.title
  form.happened = node.happened
  form.thought = node.thought || ''
  form.note = node.note || ''
  showForm.value = true
}

const saveNode = async () => {
  const nodeData = {
    date: form.date,
    endDate: form.endDate || undefined,
    isAllDay: form.isAllDay,
    type: (form.endDate ? 'range' : 'point') as 'point' | 'range',
    title: form.title,
    happened: form.happened,
    thought: form.thought || undefined,
    note: form.note || undefined,
    frames: []
  }

  if (editingId.value) {
    await updateNode(editingId.value, nodeData)
  } else {
    await addNode(nodeData)
  }
  closeForm()

  if (isLocalDev.value && confirm('是否立即保存到文件？')) {
    await saveToFile()
  }
}

const deleteNodeById = async (id: string) => {
  if (confirm('确定要删除这个事件吗？')) {
    await deleteNode(id)

    if (isLocalDev.value && confirm('是否立即保存到文件？')) {
      await saveToFile()
    }
  }
}

const saveToFile = async () => {
  if (!isLocalDev.value) {
    alert('保存功能仅在本地开发环境可用')
    return
  }

  const success = await saveNodes()
  if (success) {
    console.log('数据已保存到 public/data/timeline.json')
  }
}
</script>

<style scoped>
.events-page {
  padding: 2rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: white;
}

.page-header h1 {
  font-size: 2rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.add-btn:hover {
  transform: translateY(-2px);
}

.save-btn {
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.save-btn.saving {
  opacity: 0.7;
  cursor: not-allowed;
}

.save-message {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.save-message.success {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.save-message.error {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dev-notice,
.prod-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.dev-notice {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.prod-notice {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
  border: 1px solid rgba(156, 163, 175, 0.3);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  animation: pulse 2s infinite;
}

.dot.gray {
  background: #9ca3af;
  animation: none;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading, .empty {
  text-align: center;
  color: white;
  padding: 3rem;
  font-size: 1.1rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.event-date {
  flex-shrink: 0;
}

.date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  position: relative;
}

.date-badge.range {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.date-badge.allday::after {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
}

.day {
  font-size: 1.8rem;
  font-weight: bold;
  line-height: 1;
}

.month {
  font-size: 0.85rem;
  opacity: 0.9;
}

.allday-tag {
  position: absolute;
  bottom: -8px;
  background: #4ade80;
  color: white;
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.event-happened {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.meta-tag {
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
}

.meta-tag.range {
  background: #fef3c7;
  color: #d97706;
}

.meta-tag.thought {
  background: #e0e7ff;
  color: #4f46e5;
}

.meta-tag.note {
  background: #f3e8ff;
  color: #7c3aed;
}

.event-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.edit-btn,
.delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background: #e8f4f8;
  color: #2196f3;
}

.edit-btn:hover {
  background: #2196f3;
  color: white;
}

.delete-btn {
  background: #ffe8e8;
  color: #f44336;
}

.delete-btn:hover {
  background: #f44336;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  color: #667eea;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-group {
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: #555;
}

.checkbox-label.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-label input {
  width: auto;
}

.checkbox-label input:disabled {
  cursor: not-allowed;
}

.form-hint {
  font-size: 0.85rem;
  color: #667eea;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd6;
}
</style>
