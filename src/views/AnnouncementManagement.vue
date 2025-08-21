<script setup>
import { ref, watch, onMounted } from 'vue'

const rules = ref([])

const finalRule = {
  id: 'final',
  content: '開始使用本系統視同同意以上事項。',
  addition: ' ',
}

const newContent = ref('')

//初始化：載入localStorage
onMounted(() => {
  const saved = localStorage.getItem('rules')
  if (saved) {
    rules.value = JSON.parse(saved)
  } else {
    rules.value = [
      {
        id: 1,
        content:
          '本系出借教室悉依據本校「場地設備收費標準及管理使用要點」(以下簡稱本校場地管理要點)辦理，可提供借用場地為',
        addition:
          '(1)G312會議室 (2)G313普通教室 (3)G314普通教室 (4)G325電腦教室 (5)G316電腦教室 (6)G501會議室 (7)G508系會議室 (8)G516電腦教室 (9)G506 IOS教室',
      },
      {
        id: 2,
        content:
          '本校教學單位、行政單位申請借用場地時依據本校「場地管理要點」第十點：「(十四)」本校單位免費使用場地...」，餘依規定辦理借用申請，並依「附表四」進行收費。',
        addition: ' ',
      },
      {
        id: 3,
        content: '借用教室請於借用日期10天前至資訊科學系辦公室確認檔期並遞送借用申請表。',
        addition: ' ',
      },
      {
        id: 4,
        content:
          '借用日期或時段如非周一至周五上課時段，須提前於上課時段至系辦借用教室鑰匙，並於次上課日上午8點錢將鑰匙歸還系辦',
        addition: ' ',
      },
      {
        id: 5,
        content:
          '使用普通教室資訊設備請於使用完畢後確認所有設備電源關閉，並關妥電源、空調、擦拭黑/白板並帶走垃圾後將前、後門上鎖再行離開。',
        addition: ' ',
      },
      {
        id: 6,
        content:
          '本系如有特殊需要收回場地自行使用，得於使用7日前通知原申請單位，申請單位不得有異議。',
        addition: ' ',
      },
      {
        id: 7,
        content: '其他未盡事項悉依本校場地管理要點辦理，如有違反要點及注意事項則日後不予出借。',
        addition: ' ',
      },
      {
        id: 8,
        content: '須於使用日前至少一天完成借用申請。',
        addition: ' ',
      },
    ]
  }
})

//監聽變化，自動存入localStorage
watch(
  rules,
  (val) => {
    localStorage.setItem('rules', JSON.stringify(val))
  },
  { deep: true },
)

//新增公告
function publishAnnouncement() {
  if (!newContent.value.trim()) return

  rules.value.push({
    id: Date.now(), // 使用時間戳當唯一 key
    content: newContent.value,
    addition: '',
  })
  newContent.value = ''
}

// 刪除確認用的狀態
const showModal = ref(false)
const pendingDeleteId = ref(null)
const pendingDeleteContent = ref('')

// 開啟刪除確認
function confirmDelete(id, content) {
  pendingDeleteId.value = id
  pendingDeleteContent.value = content
  showModal.value = true
}

// 真正刪除
function deleteAnnouncement() {
  rules.value = rules.value.filter((rule) => rule.id !== pendingDeleteId.value)
  closeModal()
}

// 關閉 modal
function closeModal() {
  showModal.value = false
  pendingDeleteId.value = null
  pendingDeleteContent.value = ''
}
</script>

<template>
  <section class="addAnnouncement">
    <h3>新增公告</h3>
    <textarea v-model="newContent" placeholder="公告內容" rows="6" class="content"></textarea>
    <button @click="publishAnnouncement" class="publishBtn">發布公告</button>
  </section>

  <section class="currentAnnouncement">
    <h3>目前公告</h3>
    <div class="list">
      <ul>
        <li v-for="(rule, index) in rules" :key="rule.id">
          <span class="deleteBtn" @click="confirmDelete(rule.id, rule.content)">x</span>
          {{ index + 1 }}. {{ rule.content }}{{ rule.addition }}
        </li>
        <li :key="finalRule.id">{{ rules.length + 1 }}. {{ finalRule.content }}</li>
      </ul>
    </div>
  </section>

  <!-- Modal -->
  <div v-if="showModal" class="modalOverlay">
    <div class="modalBox">
      <h3>確認刪除公告？</h3>
      <p class="modalContent">{{ pendingDeleteContent }}</p>
      <div class="modalActions">
        <button class="cancelBtn" @click="closeModal">取消</button>
        <button class="confirmBtn" @click="deleteAnnouncement">刪除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.addAnnouncement,
.currentAnnouncement {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

h3 {
  margin-bottom: 15px;
  color: #333;
}

textarea {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: solid 1px #ddd;
  border-radius: 6px;
  resize: vertical;
  margin-bottom: 15px;
  box-sizing: border-box;
}

textarea:focus {
  outline: none;
  border-color: #333;
}

button {
  background-color: #c2ddff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 16px;
  color: #555;
  cursor: pointer;
}

button:hover {
  background-color: #a7c5eb;
}

.list {
  max-height: 400px;
  overflow-y: auto;
}

.list ul {
  padding: 0;
}

.list li {
  list-style-type: none;
  margin-bottom: 15px;
  color: #555;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
  position: relative;
  line-height: 1.5;
}

.deleteBtn {
  color: #e74c3c;
  cursor: pointer;
  margin-left: 8px;
  font-size: 18px;
  /* font-weight: bold; */
  position: absolute;
  right: 10px;
  top: 10px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.deleteBtn:hover {
  color: #fff;
  background-color: #e74c3c;
}

/* Modal */
.modalOverlay {
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

.modalBox {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modalContent {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
  text-align: left;
  max-height: 150px;
  overflow-y: auto;
  color: #666;
}

.cancelBtn {
  background-color: #ddd;
  margin-right: 20px;
  margin-top: 20px;
}

.cancelBtn:hover {
  background-color: #bbb;
}

.confirmBtn {
  background-color: #e74c3c;
  color: #fff;
}

.confirmBtn:hover {
  background-color: #c0392b;
}
</style>
