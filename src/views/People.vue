<template>
  <div class="people-page">
    <div class="page-header">
      <h1>人物管理</h1>
      <button class="add-btn" @click="showForm = true">+ 添加人物</button>
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
      <div class="modal">
        <h2>{{ editingId ? '编辑人物' : '添加人物' }}</h2>
        <form @submit.prevent="savePerson">
          <div class="form-group">
            <label>姓名 *</label>
            <input v-model="form.name" required placeholder="输入姓名" />
          </div>
          
          <div class="form-group">
            <label>生日 *</label>
            <input v-model="form.birthday" type="date" required />
          </div>
          
          <div class="form-group">
            <label>认识时间</label>
            <input v-model="form.meetDate" type="date" />
          </div>
          
          <div class="form-group">
            <label>头像 URL</label>
            <input v-model="form.avatar" placeholder="图片链接（可选）" />
          </div>
          
          <div class="form-group">
            <label>备忘</label>
            <textarea v-model="form.memo" rows="3" placeholder="备注信息..."></textarea>
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
import { ref, onMounted, reactive } from 'vue'
import PersonCard from '../components/PersonCard.vue'
import { usePeople, type Person } from '../composables/usePeople'

const { people, peopleWithAge, loading, fetchPeople, addPerson, updatePerson, deletePerson } = usePeople()

const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  name: '',
  birthday: '',
  meetDate: '',
  avatar: '',
  memo: ''
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
}

const editPerson = (person: Person) => {
  editingId.value = person.id
  form.name = person.name
  form.birthday = person.birthday
  form.meetDate = person.meetDate || ''
  form.avatar = person.avatar || ''
  form.memo = person.memo || ''
  showForm.value = true
}

const savePerson = async () => {
  if (editingId.value) {
    await updatePerson(editingId.value, { ...form })
  } else {
    await addPerson({ ...form })
  }
  closeForm()
}

const deletePersonById = async (id: string) => {
  if (confirm('确定要删除这个人物吗？')) {
    await deletePerson(id)
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
  margin-bottom: 2rem;
  color: white;
}

.page-header h1 {
  font-size: 2rem;
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

.modal h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
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

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
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
