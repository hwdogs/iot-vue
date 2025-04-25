<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { useUserStore } from '../store/user'
import { SuccessFilled, WarningFilled } from '@element-plus/icons-vue'
import { h } from 'vue'
import { userApi } from '../api/user'

const router = useRouter()
const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ]
}

const loginFormRef = ref(null)
const loading = ref(false)

// 组件挂载时检查登录状态
onMounted(() => {
  // 检查是否从注册页面跳转过来，如果是则自动填充用户名和密码
  const registerUsername = sessionStorage.getItem('registerUsername');
  const registerPassword = sessionStorage.getItem('registerPassword');
  
  if (registerUsername && registerPassword) {
    loginForm.username = registerUsername;
    loginForm.password = registerPassword;
    // 清除sessionStorage中的注册信息，避免下次登录页面加载时仍然填充
    sessionStorage.removeItem('registerUsername');
    sessionStorage.removeItem('registerPassword');
  }

  // 只检查一次登录状态，防止循环
  if (sessionStorage.getItem('loginChecked')) {
    return;
  }
  
  console.log('Login页面加载，检查登录状态');
  sessionStorage.setItem('loginChecked', 'true');
  
  // 如果用户已登录，直接跳转到仪表盘
  if (userStore.isLoggedIn) {
    console.log('用户已登录，跳转到仪表盘');
    // 直接改变窗口位置，确保一定会跳转
    window.location.href = '/dashboard/warehouses';
  }
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    console.log('登录请求数据:', {
      username: loginForm.username,
      password: loginForm.password
    })
    
    // 调用登录API
    const response = await userApi.login({
      username: loginForm.username,
      password: loginForm.password
    })
    
    console.log('登录响应:', response)
    
    if (response.code === 200 || response.code === 20000) {
      // 登录成功
      const userData = response.data
      
      // 存储用户信息和token到store
      userStore.setUserInfo({
        userId: userData.userId,
        username: userData.username,
        token: userData.token,
        role: userData.role
      })
      
      // 保存token到localStorage，用于持久化登录状态
      localStorage.setItem('token', userData.token)
      localStorage.setItem('userId', userData.userId)
      localStorage.setItem('username', userData.username)
      localStorage.setItem('role', userData.role)
      
      // 设置登录检查标记，避免重复检查
      sessionStorage.setItem('loginChecked', 'true')
      
      // 显示成功通知
      ElNotification({
        title: '登录成功',
        message: `欢迎回来，${userData.username}`,
        type: 'success',
        duration: 2000,
        showClose: true,
        position: 'top-right',
        customClass: 'success-notification'
      })
      
      console.log('登录成功，准备跳转到主页...')
      
      // 直接使用window.location.href进行硬重定向，确保页面完全重新加载
      setTimeout(() => {
        window.location.href = '/dashboard/warehouses'
      }, 1000)
    } else {
      // 登录失败
      ElMessage({
        message: h('div', { style: 'display: flex; align-items: center; color: #F56C6C;' }, [
          h('i', { 
            class: 'el-icon-error', 
            style: 'margin-right: 8px; font-size: 16px;' 
          }),
          h('span', { style: 'font-weight: 500;' }, response.msg || '用户名或密码错误')
        ]),
        type: 'error',
        duration: 3000,
        showClose: true,
        center: true,
        customClass: 'custom-error-message'
      })
    }
  } catch (error) {
    console.error('Login error:', error)
    ElMessage({
      message: h('div', { style: 'display: flex; align-items: center; color: #F56C6C;' }, [
        h('i', { 
          class: 'el-icon-error', 
          style: 'margin-right: 8px; font-size: 16px;' 
        }),
        h('span', { style: 'font-weight: 500;' }, error.response?.data?.msg || '登录失败，请检查网络连接')
      ]),
      type: 'error',
      duration: 3000,
      showClose: true,
      center: true,
      customClass: 'custom-error-message'
    })
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>物联网智能仓库管理系统</h2>
        <p>IOT Warehouse Management System</p>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" 
        label-width="0" class="login-form" status-icon>
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="el-icon-user" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="el-icon-lock"
            show-password @keyup.enter="handleLogin" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-button" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>

        <div class="login-options">
          <span class="register-link" @click="goToRegister">注册账号</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.login-header p {
  margin: 10px 0 0;
  font-size: 14px;
  color: #909399;
}

.login-form {
  margin-top: 30px;
}

.login-button {
  width: 100%;
}

.login-options {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  font-size: 14px;
}

.register-link {
  color: #409eff;
  cursor: pointer;
}

.register-link:hover {
  text-decoration: underline;
}

/* 自定义成功消息弹窗样式 */
:deep(.success-notification) {
  background-color: #f0f9eb !important;
  border-color: #e1f3d8 !important;
}

:deep(.success-notification .el-notification__title) {
  color: #67C23A !important;
  font-weight: bold;
}

:deep(.success-notification .el-notification__content) {
  color: #67C23A !important;
}

/* 自定义错误消息弹窗样式 */
:deep(.custom-error-message) {
  background-color: #FEF0F0 !important;
  border-color: #FDE2E2 !important;
  color: #F56C6C !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

:deep(.custom-error-message .el-message__content) {
  color: #F56C6C !important;
  font-weight: 500;
}

:deep(.custom-error-message .el-message__icon) {
  display: none;
}

/* 自定义表单验证错误样式 */
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(245, 108, 108, 0.5) inset !important;
}

:deep(.el-form-item.is-error .el-form-item__error) {
  color: #F56C6C;
  font-size: 12px;
  padding-top: 4px;
}

:deep(.el-form-item__error) {
  position: relative;
  top: 0;
  left: 0;
}

:deep(.el-form-item.is-error .el-input__validateIcon) {
  color: #F56C6C !important;
}

:deep(.el-form-item.is-success .el-input__validateIcon) {
  color: #67C23A !important;
}
</style>