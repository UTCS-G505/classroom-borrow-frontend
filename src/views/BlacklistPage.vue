<script setup>
import { ref } from 'vue'

const { blacklist } = defineProps({
  blacklist: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['deleteBlacklist'])

// 控制 modal
const showModal = ref(false)
const deleteIndex = ref(null)

//打開確認框
const openConfirm = (index) => {
  deleteIndex.value = index
  showModal.value = true
}

//確認刪除
const confirmDelete = () => {
  if (deleteIndex.value != null) {
    emit('deleteBlacklist', deleteIndex.value)
  }

  closeModal()
}

//取消刪除
const closeModal = () => {
  showModal.value = false
  deleteIndex.value = null
}
</script>

<template>
  <section class="list">
    <h3>黑名單列表</h3>
    <table v-if="blacklist.length">
      <thead>
        <tr>
          <th>申請人</th>
          <th>教室</th>
          <th>時間</th>
          <th>備註</th>
          <th>操作</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(item, index) in blacklist" :key="index">
          <td>{{ item.applicant }}</td>
          <td>{{ item.classroom }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.reason }}</td>
          <td>
            <button @click="openConfirm(index)">刪除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>目前沒有黑名單資料</p>
  </section>

  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <p>確定要刪除此黑名單項目?</p>
      <!-- 顯示要刪除的項目細節 -->
      <div v-if="deleteIndex !== null" class="modal-content">
        <p style="color: #555; margin-top: 10px">
          【申請人：{{ blacklist[deleteIndex].applicant }}】
        </p>
      </div>
      <div class="modal-actions">
        <button class="cancel" @click="closeModal">取消</button>
        <button class="confirm" @click="confirmDelete">確定</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

h3 {
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #e6e6e6;
}

th,
td {
  border: solid 1px #ddd;
  padding: 8px;
  text-align: center;
}

button {
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  background-color: #dcdddf;
  color: #666;
  cursor: pointer;
  margin-right: 5px;
}

button.confirm {
  background-color: #e74c3c;
  color: #fff;
}

button.confirm:hover {
  background-color: #c0392b;
}

button.cancel {
  background-color: #ddd;
  margin-right: 20px;
  margin-top: 20px;
}

button.cancel:hover {
  background-color: #bbb;
}

/* Modal 樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 300px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}

@media (max-width: 768px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
