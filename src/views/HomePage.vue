<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

//按鈕相關
const link = ref([
  {
    id: 'seeClass',
    name: '查看教室',
    url: '/introduction',
  },
  {
    id: 'startBorrow',
    name: '立即借用',
    url: '/borrow',
  },
])

const rules = ref([])

const finalRule = {
  id: 'final',
  content: '開始使用本系統視同同意以上事項。',
  addition: ' ',
}

onMounted(() => {
  const saved = localStorage.getItem('rules')
  if (saved) {
    rules.value = JSON.parse(saved)
  }
})

function changePage(link) {
  router.push({
    path: link,
  })
}

const router = useRouter()
</script>

<template>
  <section class="introduction">
    <!-- 標題 -->
    <div class="header">
      <div class="header1">臺北市立大學 資訊科學系</div>
      <div class="header2">教室借用系統</div>
    </div>
    <br />

    <!-- 按鈕 -->
    <div class="pageSwitchButton">
      <button v-for="btn in link" :key="btn.id" @click="changePage(btn.url)">
        {{ btn.name }}
      </button>
    </div>

    <div class="interval">
      <br />
    </div>

    <br />
    <h1>注意事項</h1>
    <hr />

    <!-- 規則 -->
    <div class="ruleIntro" v-for="(rule, index) in rules" :key="rule.id">
      <div class="ruleSentence">{{ index + 1 }}. {{ rule.content }}<br /><br /></div>
      <div class="ruleAddition" v-if="rule.addition.trim()">{{ rule.addition }}<br /><br /></div>
    </div>

    <!-- 永遠最後一條 -->
    <div class="ruleIntro" :key="finalRule.id">
      <div class="ruleSentence">{{ rules.length + 1 }}. {{ finalRule.content }}</div>
    </div>

    <div class="interval"></div>

    <!-- 版權 --
        <p class = "copyright" >
            © 2025 臺北市立大學 資訊科學系(含碩士班) 版權所有<br>
            Copyright © 2025 University of Taipei Department of Computer Scinece. All Rights Reverved.<br>
        </p>
        -->
  </section>
</template>

<style scoped>
.introduction {
  color: #666;
  max-width: 75%;
  margin: 40px auto;
  text-align: center;
  font-family: Arial, sans-serif;
}
.header {
  height: auto;
}

.header1 {
  font-size: clamp(14px, 6vw, 40px);
  color: #404040;
  margin-top: 120px;
}

.header2 {
  font-size: clamp(16px, 8vw, 60px);
  color: #333333;
  margin-bottom: 80px;
}

.interval {
  height: 150px;
}

.introduction hr {
  max-width: 50%;
  opacity: 50%;
}

.ruleIntro {
  text-align: left;
  font-size: 20px;
}

.buttonGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

button {
  background-color: #c2ddff;
  border: none;
  padding: 12px 28px;
  border-radius: 25px;
  font-size: 16px;
  color: #555;
  font-weight: 500;
  cursor: pointer;
  margin: 30px;
}

button:hover {
  background-color: #a7c5eb;
}

.copyright {
  font-size: 10px;
  opacity: 70%;
}
</style>
