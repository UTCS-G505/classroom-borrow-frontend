<script setup>
// filepath: d:\VuePractice\vue-LogIn\classroom-borrow-frontend\src\views\LoginView.vue
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 登入相關
const username = ref('')
const password = ref('')
const role = ref('')
const errorMessage = ref('')

// 註冊相關
const registerUsername = ref('')
const registerPassword = ref('')
const confirmPassword = ref('')
const registerServiceUnit = ref('')
const registerName = ref('')
const registerPhone = ref('')
const registerEmail = ref('')
const registerErrorMessage = ref('')

// 儲存已註冊的用戶
const registeredUsers = ref([])

// 視圖切換
const isLoginView = ref(true)

const router = useRouter()

const handleLogin = () => {
  if (!username.value || !password.value || !role.value) {
    errorMessage.value = '請填寫所有欄位並選擇身份'
    return
  }

  // 管理員登入
  if (username.value === 'admin' && password.value === '1234' && role.value === '管理員') {
    errorMessage.value = ''
    router.push('/') // 跳回首頁
    return
  }

  // 檢查註冊用戶登入（訪客身分）
  if (role.value === '訪客') {
    const user = registeredUsers.value.find(
      (u) => u.username === username.value && u.password === password.value,
    )
    if (user) {
      errorMessage.value = ''
      router.push('/') // 跳回首頁
      return
    }
  }

  errorMessage.value = '帳號或密碼錯誤'
}

const handleRegister = () => {
  if (
    !registerUsername.value ||
    !registerPassword.value ||
    !confirmPassword.value ||
    !registerServiceUnit.value ||
    !registerName.value ||
    !registerPhone.value ||
    !registerEmail.value
  ) {
    registerErrorMessage.value = '請填寫所有欄位'
    return
  }

  // 檢查帳號是否已存在
  if (registeredUsers.value.some((u) => u.username === registerUsername.value)) {
    registerErrorMessage.value = '此帳號已存在，請選擇其他帳號'
    return
  }

  if (registerPassword.value !== confirmPassword.value) {
    registerErrorMessage.value = '密碼確認不一致'
    return
  }

  // 簡單的email格式驗證
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerEmail.value)) {
    registerErrorMessage.value = 'Email格式不正確'
    return
  }

  // 手機號碼驗證：僅允許包含數字 0123456789
  const phoneRegex = /^[0-9]+$/
  if (!phoneRegex.test(registerPhone.value)) {
    registerErrorMessage.value = '手機號碼只能包含數字'
    return
  }

  // 新增用戶到註冊清單
  registeredUsers.value.push({
    username: registerUsername.value,
    password: registerPassword.value,
    name: registerName.value,
    serviceUnit: registerServiceUnit.value,
    phone: registerPhone.value,
    email: registerEmail.value,
  })

  registerErrorMessage.value = ''
  alert('註冊成功！') // 顯示註冊成功提示
  switchToLogin() // 註冊成功後切換到登入頁面
}

const switchToLogin = () => {
  isLoginView.value = true
  // 清空註冊表單和錯誤訊息
  registerUsername.value = ''
  registerPassword.value = ''
  confirmPassword.value = ''
  registerServiceUnit.value = ''
  registerName.value = ''
  registerPhone.value = ''
  registerEmail.value = ''
  registerErrorMessage.value = ''
}

const switchToRegister = () => {
  isLoginView.value = false
  // 清空登入表單和錯誤訊息
  username.value = ''
  password.value = ''
  role.value = ''
  errorMessage.value = ''
}
</script>

<template>
  <div class="page-wrapper">
    <!-- 登入視圖 -->
    <div v-if="isLoginView" class="login-container">
      <h1 class="title">登入</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="label">選擇身分:</label>
          <div class="role-selection">
            <button type="button" :class="{ active: role === '學生' }" @click="role = '學生'">
              學生
            </button>
            <button type="button" :class="{ active: role === '教師' }" @click="role = '教師'">
              教師
            </button>
            <button type="button" :class="{ active: role === '管理員' }" @click="role = '管理員'">
              管理員
            </button>
            <button type="button" :class="{ active: role === '訪客' }" @click="role = '訪客'">
              訪客
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="label" for="username">帳號：</label>
          <input
            style="color: #b0b0b0"
            type="text"
            id="username"
            v-model="username"
            placeholder="校務系統帳號"
          />
        </div>

        <div class="form-group">
          <label class="label" for="password">密碼：</label>
          <input
            style="color: #b0b0b0"
            type="password"
            id="password"
            v-model="password"
            placeholder="校務系統密碼"
          />
        </div>

        <div class="button-group">
          <button type="submit" class="login-button">登入 Sign In</button>
          <button type="button" class="register-button" @click="switchToRegister">
            註冊 Register
          </button>
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>

    <!-- 註冊視圖 -->
    <div v-else class="register-container">
      <h1 class="title">註冊</h1>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label class="label" for="register-name">姓名：</label>
          <input
            type="text"
            id="register-name"
            v-model="registerName"
            placeholder="請輸入真實姓名"
          />
        </div>

        <div class="form-group">
          <label class="label" for="register-service-unit">服務單位：</label>
          <input
            type="text"
            id="register-service-unit"
            v-model="registerServiceUnit"
            placeholder="請輸入您的服務單位/公司/機關"
          />
        </div>

        <div class="form-group">
          <label class="label" for="register-username">帳號：</label>
          <input
            type="text"
            id="register-username"
            v-model="registerUsername"
            placeholder="請輸入帳號"
          />
        </div>

        <div class="form-group">
          <label class="label" for="register-password">密碼：</label>
          <input
            type="password"
            id="register-password"
            v-model="registerPassword"
            placeholder="請輸入密碼"
          />
        </div>

        <div class="form-group">
          <label class="label" for="confirm-password">確認密碼：</label>
          <input
            type="password"
            id="confirm-password"
            v-model="confirmPassword"
            placeholder="請再次輸入密碼"
          />
        </div>

        <div class="form-group">
          <label class="label" for="register-phone">手機號碼：</label>
          <input type="tel" id="register-phone" v-model="registerPhone" placeholder="請輸入電話號碼" />
        </div>

        <div class="form-group">
          <label class="label" for="register-email">Email：</label>
          <input
            type="email"
            id="register-email"
            v-model="registerEmail"
            placeholder="example@email.com"
          />
        </div>

        <div class="button-group">
          <button type="submit" class="login-button">註冊 Register</button>
          <button type="button" class="register-button" @click="switchToLogin">返回登入</button>
        </div>

        <div class="register-hint">
          <p class="hint-text">
            <i class="info-icon">ℹ️</i>
            註冊成功後，請使用「訪客」身分登入系統
          </p>
        </div>

        <p v-if="registerErrorMessage" class="error">{{ registerErrorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* 調整頁面大小 */
.page-wrapper {
  min-height: 100vh;
  width: 100%;
  background-color: #f2f2f2;
  padding: 40px; /* 增加 padding */
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.login-container,
.register-container {
  width: 100%;
  max-width: 600px; /* 放大容器寬度 */
  padding: 40px 50px; /* 增加 padding */
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.08);
  font-family: 'Microsoft JhengHei', sans-serif;
  margin: auto;
}

/* 註冊頁面表單容器 */
.register-form {
  width: 100%;
}

/* 放大登入字體並置中 */
.title {
  font-size: 32px; /* 放大字體 */
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

/* 放大標籤字體 */
.label {
  display: block;
  margin-bottom: 10px;
  font-size: 18px; /* 放大字體 */
  color: #444;
}

.form-group {
  margin-bottom: 20px;
}

input,
.role-dropdown {
  width: 100%;
  padding: 14px; /* 增加 padding */
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: 16px; /* 放大字體 */
  box-sizing: border-box;
  color: #333;
}

input:focus,
.role-dropdown:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 4px rgba(74, 144, 226, 0.5);
}

/* 滾輪式身分選擇 */
.role-dropdown {
  background-color: white;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8"><path fill="%23666" d="M6 8L0 2h12z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.role-dropdown option {
  padding: 10px;
  font-size: 16px;
  color: #333;
}

/* 三個角色按鈕 */
.role-selection {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.role-selection button {
  flex: 1;
  min-width: 120px;
  padding: 12px 8px; /* 增加 padding */
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  background-color: #f8f8f8;
  cursor: pointer;
  font-size: 16px; /* 放大字體 */
  color: #b0b0b0; /* 字體顏色改為淺灰色 */
}

.role-selection button.active {
  background-color: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

/* 調整按鈕容器 */
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 30px; /* 增加間距 */
}

/* 登入按鈕 */
.login-button {
  width: 65%; /* 調整寬度以適應一左一右布局 */
  padding: 14px; /* 增加 padding */
  font-size: 18px; /* 放大字體 */
  background-color: #a6c8ff;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #8eb8ff;
}

/* 註冊按鈕 */
.register-button {
  width: 34%; /* 調整寬度以適應一左一右布局 */
  padding: 14px; /* 增加 padding */
  font-size: 18px; /* 放大字體 */
  background-color: white;
  color: #4a90e2;
  border: 1px solid #4a90e2;
  border-radius: 8px;
  cursor: pointer;
}

.register-button:hover {
  background-color: #e6f0ff;
}

.error {
  margin-top: 10px;
  color: red;
  font-size: 16px; /* 放大字體 */
  text-align: center;
}

input::placeholder {
  color: #b0b0b0;
}

/* 註冊提示樣式 */
.register-hint {
  margin-top: 20px;
  text-align: center;
}

.hint-text {
  font-size: 14px;
  color: #666;
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 4px solid #4a90e2;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.info-icon {
  font-size: 16px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .page-wrapper {
    padding: 20px;
  }

  .login-container,
  .register-container {
    padding: 30px 25px;
  }

  .role-selection {
    flex-direction: column;
  }

  .role-selection button {
    width: 100%;
    margin-bottom: 8px;
  }
}

@media (max-height: 700px) {
  .page-wrapper {
    align-items: flex-start;
    padding: 20px;
  }
}
</style>
