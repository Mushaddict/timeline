<template>
  <div class="people-page">
    <div class="page-header">
      <h1>人物管理</h1>
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
        <button
          v-if="isLocalDev"
          class="backup-btn"
          @click="createBackup"
        >
          📦 备份
        </button>
        <button class="add-btn" @click="showForm = true">+ 添加人物</button>
      </div>
    </div>

    <!-- 保存状态消息 -->
    <div v-if="saveMessage" class="save-message" :class="{ 'success': saveMessage.includes('✅'), 'error': saveMessage.includes('❌') }">
      {{ saveMessage }}
    </div>

    <!-- 本地开发提示 -->
    <div v-if="isLocalDev" class="dev-notice">
      <span class="dot"></span>
      本地开发模式 - 修改后点击"保存到文件"可将数据写入 public/data/people.json
    </div>
    <div v-else class="prod-notice">
      <span class="dot gray"></span>
      生产模式 - 数据仅保存在内存中，刷新页面后恢复
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="people-grid">
      <PersonCard
        v-for="person in peopleWithAge"
        :key="person.id"
        :person="person"
        @edit="editPerson"
        @delete="deletePersonById"
      />
    </div>

    <div v-if="people.length === 0 && !loading" class="empty">
      还没有添加任何人物，点击上方按钮添加
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal modal-large">
        <h2>{{ editingId ? '编辑人物' : '添加人物' }}</h2>
        <form @submit.prevent="savePerson">
          <div class="form-section">
            <h3>基本信息</h3>
            <div class="form-group">
              <label>姓名 *</label>
              <input v-model="form.name" required placeholder="输入姓名" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>生日 *</label>
                <input v-model="form.birthday" type="date" required />
              </div>

              <div class="form-group">
                <label>认识时间</label>
                <input v-model="form.meetDate" type="date" />
              </div>
            </div>

            <div class="form-group">
              <label>头像 URL</label>
              <input v-model="form.avatar" placeholder="图片链接（可选）" />
            </div>

            <div class="form-group">
              <label>备忘</label>
              <textarea v-model="form.memo" rows="2" placeholder="备注信息..."></textarea>
            </div>
          </div>

          <!-- 时间段管理 -->
          <div class="form-section">
            <div class="section-header">
              <h3>重要时间段</h3>
              <button type="button" class="add-range-btn" @click="addTimeRange">
                + 添加时间段
              </button>
            </div>

            <div v-if="form.timeRanges.length === 0" class="empty-ranges">
              还没有添加时间段，点击上方按钮添加
            </div>

            <div v-for="(range, index) in form.timeRanges" :key="range.id" class="time-range-item">
              <div class="range-header">
                <span class="range-number">时间段 {{ index + 1 }}</span>
                <button type="button" class="delete-range-btn" @click="removeTimeRange(index)">删除</button>
              </div>

              <div class="form-group">
                <label>标题 *</label>
                <input v-model="range.title" required placeholder="例如：高中同学、同事期间..." />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>开始时间 *</label>
                  <input v-model="range.startDate" type="date" required />
                </div>

                <div class="form-group">
                  <label>结束时间</label>
                  <div class="end-date-input">
                    <input
                      v-if="!range.isPresent"
                      v-model="range.endDate"
                      type="date"
                      :required="!range.isPresent"
                    />
                    <label class="present-checkbox">
                      <input type="checkbox" v-model="range.isPresent" />
                      <span>至今</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>描述</label>
                <textarea v-model="range.description" rows="2" placeholder="这段时间的特别回忆..."></textarea>
              </div>
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
import { ref, onMounted, reactive, computed } from 'vue'
import PersonCard from '../components/PersonCard.vue'
import { usePeople, type Person, type TimeRange } from '../composables/usePeople'

const {
  people,
  peopleWithAge,
  loading,
  saving,
  saveMessage,
  fetchPeople,
  savePeople,
  backupData,
  addPerson,
  updatePerson,
  deletePerson
} = usePeople()

interface TimeRangeForm {
  id: string
  title: string
  startDate: string
  endDate: string
  isPresent: boolean
  description: string
}

const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  name: '',
  birthday: '',
  meetDate: '',
  avatar: '',
  memo: '',
  timeRanges: [] as TimeRangeForm[]
})

const isLocalDev = computed(() => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
})

onMounted(() => {
  fetchPeople()
})

const closeForm = () => {
  showForm.value = false
  editingId.value = null
  form.name = ''
  form.birthday = ''
  form.meetDate = ''
  form.avatar = ''
  form.memo = ''
  form.timeRanges = []
}

const addTimeRange = () => {
  form.timeRanges.push({
    id: `tr${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    title: '',
    startDate: '',
    endDate: '',
    isPresent: false,
    description: ''
  })
}

const removeTimeRange = (index: number) => {
  form.timeRanges.splice(index, 1)
}

const convertTimeRanges = (ranges: TimeRangeForm[]): TimeRange[] => {
  return ranges.map(r => ({
    id: r.id,
    title: r.title,
    startDate: r.startDate,
    endDate: r.isPresent ? 'present' : r.endDate,
    description: r.description
  }))
}

const parseTimeRanges = (ranges: TimeRange[] = []): TimeRangeForm[] => {
  return ranges.map(r => ({
    id: r.id,
    title: r.title,
    startDate: r.startDate,
    endDate: r.endDate === 'present' ? '' : r.endDate,
    isPresent: r.endDate === 'present',
    description: r.description || ''
  }))
}

const editPerson = (person: Person) => {
  editingId.value = person.id
  form.name = person.name
  form.birthday = person.birthday
  form.meetDate = person.meetDate || ''
  form.avatar = person.avatar || ''
  form.memo = person.memo || ''
  form.timeRanges = parseTimeRanges(person.timeRanges)
  showForm.value = true
}

const savePerson = async () => {
  const personData = {
    ...form,
    timeRanges: convertTimeRanges(form.timeRanges)
  }

  if (editingId.value) {
    await updatePerson(editingId.value, personData)
  } else {
    await addPerson(personData)
  }
  closeForm()

  // 本地开发模式下询问是否保存到文件
  if (isLocalDev.value && confirm('是否立即保存到文件？')) {
    await saveToFile()
  }
}

const deletePersonById = async (id: string) => {
  if (confirm('确定要删除这个人物吗？')) {
    await deletePerson(id)

    // 本地开发模式下询问是否保存到文件
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

  const success = await savePeople()
  if (success) {
    console.log('数据已保存到 public/data/people.json')
  }
}

const createBackup = async () => {
  const success = await backupData()
  if (success) {
    console.log('备份已创建')
  }
}
</script>

<style scoped>
.people-page {
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

.backup-btn {
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.backup-btn:hover {
  background: rgba(255, 255, 255, 0.3);
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

.people-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.loading, .empty {
  text-align: center;
  color: white;
  padding: 3rem;
  font-size: 1.1rem;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 700px;
}

.modal h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  color: #667eea;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.add-range-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-range-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.empty-ranges {
  text-align: center;
  color: #999;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
}

.time-range-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid #e0e0e0;
}

.range-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.range-number {
  font-weight: 600;
  color: #667eea;
}

.delete-range-btn {
  padding: 0.3rem 0.8rem;
  background: #ffe8e8;
  color: #f44336;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-range-btn:hover {
  background: #f44336;
  color: white;
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
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.end-date-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.present-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
}

.present-checkbox input {
  width: auto;
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
