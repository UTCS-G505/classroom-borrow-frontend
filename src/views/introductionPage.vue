<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 教室資料
const classrooms = ref([
  {
    id: 'G312',
    name: 'G312 會議室',
    location: '公誠樓 3 樓',
    equipment: '白板、投影幕、桌椅',
    img: ['/picture/G312-1.jpg', '/picture/G312-2.jpg'],
    seatMap: '/downloads/G312-seatmap.pdf',
  },
  {
    id: 'G313',
    name: 'G313 普通教室',
    location: '公誠樓 3 樓',
    equipment: '黑板、投影幕、桌椅',
    img: ['/picture/G313-1.jpg', '/picture/G313-2.jpg', '/picture/G313-3.jpg'],
    seatMap: '/downloads/G313-seatmap.pdf',
  },
  {
    id: 'G314',
    name: 'G314 普通教室',
    location: '公誠樓 3 樓',
    equipment: '黑板、投影幕、桌椅',
    img: ['/picture/G314-1.jpg', '/picture/G314-2.jpg', '/picture/G314-3.jpg'],
    seatMap: '/downloads/G314-seatmap.pdf',
  },
  {
    id: 'G315',
    name: 'G315 電腦教室',
    location: '公誠樓 3 樓',
    equipment: '電腦、白板、黑板、投影幕',
    description: '可容納 50 人....',
    img: ['/picture/G315-1.jpg', '/picture/G315-2.jpg', '/picture/G315-3.jpg'],
    seatMap: '/downloads/G315-seatmap.pdf',
  },
  {
    id: 'G316',
    name: 'G316 電腦教室',
    location: '公誠樓 3 樓',
    equipment: '電腦、白板、黑板、投影幕',
    img: ['/picture/G316-1.jpg', '/picture/G316-2.jpg'],
    seatMap: '/downloads/G316-seatmap.pdf',
  },
  {
    id: 'G501',
    name: 'G501 會議室',
    location: '公誠樓 5 樓',
    equipment: '白板、投影幕、桌椅',
    img: ['/picture/G501-1.jpg', '/picture/G501-2.jpg'],
    seatMap: '/downloads/G501-seatmap.pdf',
  },
  {
    id: 'G508',
    name: 'G508 系圖書室',
    location: '公誠樓 5 樓',
    equipment: '書、桌椅、白板、投影幕',
    img: ['/picture/G508-1.jpg', '/picture/G508-2.jpg'],
    seatMap: '/downloads/G508-seatmap.pdf',
  },
  {
    id: 'G509',
    name: 'G509 IOS教室',
    location: '公誠樓 5 樓',
    equipment: 'Mac 電腦、白板、投影幕',
    img: ['/picture/G509-1.jpg', '/picture/G509-2.jpg'],
    seatMap: '/downloads/G509-seatmap.pdf',
  },
  {
    id: 'G516',
    name: 'G516 電腦教室',
    location: '公誠樓 5 樓',
    equipment: '電腦、白板、投影幕',
    img: ['/picture/G516-1.jpg', '/picture/G516-2.jpg'],
    seatMap: '/downloads/G516-seatmap.pdf',
  },
])

// 儲存每個教室目前圖片索引
const currentImageIndex = ref({}) // { 'G312': 0, 'G313': 0, ... }

// 下一張圖片
function nextImage(roomId, imgLength) {
  if (!(roomId in currentImageIndex.value)) {
    currentImageIndex.value[roomId] = 0
  }
  currentImageIndex.value[roomId] = (currentImageIndex.value[roomId] + 1) % imgLength
}

// 上一張圖片
function prevImage(roomId, imgLength) {
  if (!(roomId in currentImageIndex.value)) {
    currentImageIndex.value[roomId] = 0
  }
  currentImageIndex.value[roomId] = (currentImageIndex.value[roomId] - 1 + imgLength) % imgLength
}

// 樓層平面圖資料
const floorPlans = ref([
  { title: '三樓平面圖', img: '/picture/floor3.png' },
  { title: '五樓平面圖', img: '/picture/floor5.png' },
])

// 點選按鈕，滑動到對應的教室介紹
function scrollToRoom(id) {
  const target = document.getElementById(id)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

//導向借用頁面
const router = useRouter()

function goToBorrowPage(roomId) {
  router.push({
    path: '/borrow',
    query: { roomId },
  })
}
</script>

<template>
  <section class="introduction">
    <h1>教室介紹</h1>
    <hr />
    <p>可提供借用教室為</p>

    <!-- 教室按鈕區塊 -->
    <div class="buttonGrid">
      <button v-for="room in classrooms" :key="room.id" @click="scrollToRoom(room.id)">
        {{ room.name }}
      </button>
    </div>

    <!-- 樓層平面圖展示 -->
    <div class="floorPlans">
      <div class="plan" v-for="plan in floorPlans" :key="plan.title">
        <h3>{{ plan.title }}</h3>
        <img :src="plan.img" :alt="plan.title" />
      </div>
    </div>

    <!--各教室介紹區塊-->
    <div class="classroomIntro" v-for="room in classrooms" :key="room.id" :id="room.id">
      <!-- 圖片輪播區 -->
      <div class="classroomImage">
        <div class="carousel-container">
          <!-- 圖片列 (橫向排列) -->
          <div
            class="carousel-track"
            :style="{
              transform: `translateX(-${(currentImageIndex[room.id] || 0) * 100}%)`,
            }"
          >
            <div v-for="(imgSrc, index) in room.img" :key="imgSrc" class="carousel-slide">
              <img :src="imgSrc" :alt="`${room.name} 圖片 ${index + 1}`" />
            </div>
          </div>

          <!-- 左右切換按鈕 -->
          <button
            v-if="room.img.length > 1"
            class="carousel-btn prev"
            @click="prevImage(room.id, room.img.length)"
          >
            ‹
          </button>
          <button
            v-if="room.img.length > 1"
            class="carousel-btn next"
            @click="nextImage(room.id, room.img.length)"
          >
            ›
          </button>

          <!-- 圖片下方的圓點指示器 -->
          <div v-if="room.img.length > 1" class="carousel-dots">
            <span
              v-for="(img, dotIndex) in room.img"
              :key="dotIndex"
              class="dot"
              :class="{ active: (currentImageIndex[room.id] || 0) === dotIndex }"
              @click="currentImageIndex[room.id] = dotIndex"
            ></span>
          </div>
        </div>
      </div>

      <!-- 教室資訊區 -->
      <div class="classroomInfo">
        <h3>{{ room.name }}</h3>
        <p><strong>位置：</strong>{{ room.location }}</p>
        <p><strong>設備：</strong>{{ room.equipment }}</p>
        <a
          v-if="!['G508 系圖書室', 'G312 會議室', 'G501 會議室'].includes(room.name)"
          :href="room.seatMap"
          download
          >下載教室座位表.pdf ⬇</a
        >
        <button class="borrowBtn" @click="goToBorrowPage(room.id)">我要借用</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.introduction {
  max-width: 1000px;
  margin: 40px auto;
  color: #666;
}

.introduction h1 {
  font-size: 30px;
  margin-bottom: 20px;
}

.introduction p {
  font-size: 20px;
  margin-bottom: 25px;
}

/* 教室按鈕區 */
.buttonGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

button {
  background-color: #c2ddff;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 16px;
  color: #555;
  font-weight: 500;
  cursor: pointer;
}

button:hover {
  background-color: #a7c5eb;
}

/* 樓層平面圖 */
.floorPlans {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  margin-top: 50px;
}

.plan {
  flex: 1 1 300px;
  max-width: 500px;
  height: auto;
  text-align: center;
}

.plan img {
  height: auto;
  width: 100%;
}

/* 教室介紹  */
.classroomIntro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  padding: 20px;
  margin-top: 30px;
  background-color: #eae8e6;
}

/* 教室圖片*/
.classroomImage {
  flex: 2;
  position: relative;
}

.classroomImage img {
  width: 600px;
  height: 400px;
  object-fit: cover;
  display: block;
}

/* ======== 照片輪播 ======== */
.carousel-container {
  position: relative;
  width: 600px;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
}

.carousel-track {
  display: flex;
  transition: transform 0.8s ease-in-out;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  min-width: 100%;
  height: 100%;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ======== 左右按鈕 ======== */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  color: #555;
  border: none;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.carousel-btn:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.carousel-btn.prev {
  left: 10px;
}

.carousel-btn.next {
  right: 20px;
}

/* 圖片下方圓點指示器 */
.carousel-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dot.active {
  background-color: #ffffff;
}

/* 教室資訊 */
.classroomInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.classroomInfo h3 {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #444;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
}

.classroomInfo p {
  margin: 8px 0;
  color: #666;
  font-size: 16px;
}

.classroomInfo a {
  margin-top: 15px;
  color: #666;
  text-decoration: none;
}

.classroomInfo a:hover {
  text-decoration: underline;
}

/* 借用按鈕 */
.borrowBtn {
  margin-top: 30px;
  background-color: #d9d9d9;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
}

.borrowBtn:hover {
  background-color: #ccc;
}

@media (max-width: 767px) {
  /* 調整整個 section 的 margin */
  .introduction {
    margin: 20px 15px;
  }

  /* 按鈕網格改成 2 列*/
  .buttonGrid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  /* 各教室區塊改成直式排列，間距縮小 */
  .classroomIntro {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .classroomImage,
  .classroomInfo {
    width: 100%;
  }

  .classroomImage img {
    width: 100%; /* 佔滿容器寬度 */
    height: auto; /* 保持比例 */
    max-height: 300px; /* 可以調整手機最大高度 */
    object-fit: cover;
    border-radius: 8px;
  }

  .carousel-container {
    width: 100%;
    height: auto;
  }

  .carousel-slide img {
    height: auto;
  }

  .carousel-btn {
    width: 30px;
    height: 30px;
    font-size: 18px;
  }

  /* 樓層平面圖區塊文字調整 */
  .floorPlans h3 {
    margin-bottom: 15px;
  }
}
</style>
