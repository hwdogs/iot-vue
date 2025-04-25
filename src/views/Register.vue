<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { userApi } from '../api/user'
import { WarningFilled, CircleCheckFilled } from '@element-plus/icons-vue'
import { h } from 'vue'

const router = useRouter()

const registerForm = reactive({
  username: '',
  passwordHash: '',
  passwordConfirm: '',
  email: '',
  biometricToken: '',
  role: '',  // 初始值设为空
  agreeTerms: false
})

// 监听agreeTerms的变化，当用户勾选同意协议时将role设置为1
watch(() => registerForm.agreeTerms, (newValue) => {
  if (newValue) {
    registerForm.role = 1  // 设置角色为1
  } else {
    registerForm.role = ''  // 未勾选时重置role
  }
})

// 简化的密码验证逻辑
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.passwordHash) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const validateTerms = (rule, value, callback) => {
  if (!value) {
    callback(new Error('必须同意用户协议才能注册'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  passwordHash: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ],
  passwordConfirm: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  agreeTerms: [
    { validator: validateTerms, trigger: 'change' }
  ]
}

const registerFormRef = ref(null)
const loading = ref(false)

// 手动验证密码匹配
const checkPasswordMatch = () => {
  if (registerForm.passwordHash && registerForm.passwordConfirm) {
    return registerForm.passwordHash === registerForm.passwordConfirm
  }
  return true
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    // 手动检查密码匹配
    if (!checkPasswordMatch()) {
      ElMessage({
        message: h('div', { style: 'display: flex; align-items: center; color: #F56C6C;' }, [
          h('i', { 
            class: 'el-icon-error', 
            style: 'margin-right: 8px; font-size: 16px;' 
          }),
          h('span', { style: 'font-weight: 500;' }, '两次输入密码不一致，请检查')
        ]),
        type: 'error',
        duration: 3000,
        showClose: true,
        center: true,
        customClass: 'custom-error-message'
      })
      return
    }

    await registerFormRef.value.validate()
    
    loading.value = true
    console.log('注册信息：', {
      username: registerForm.username,
      passwordHash: registerForm.passwordHash,
      passwordConfirm: registerForm.passwordConfirm,
      email: registerForm.email,
      biometricToken: registerForm.biometricToken,
      role: registerForm.role
    })
    
    const response = await userApi.register({
      username: registerForm.username,
      passwordHash: registerForm.passwordHash,
      passwordConfirm: registerForm.passwordConfirm,
      email: registerForm.email,
      biometricToken: registerForm.biometricToken,
      role: registerForm.role
    })
    
    if (response.code === 200 || response.code === 20000) {
      // 使用通知组件显示成功消息
      ElNotification({
        title: '注册成功',
        message: '您已成功注册账号，即将跳转到登录页面',
        type: 'success',
        duration: 3000,
        showClose: true,
        position: 'top-right',
        customClass: 'success-notification'  // 添加自定义样式类
      })
      
      console.log('注册成功，准备跳转...');
      
      // 清除登录检查标记，确保可以正常登录
      sessionStorage.removeItem('loginChecked');
      
      // 保存注册的用户名和密码到sessionStorage，用于登录页面自动填充
      sessionStorage.setItem('registerUsername', registerForm.username);
      sessionStorage.setItem('registerPassword', registerForm.passwordHash);
      
      // 延迟后跳转到登录页面，使用直接跳转确保页面刷新
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000)
    } else {
      // 使用自定义样式的错误消息
      ElMessage({
        message: h('div', { style: 'display: flex; align-items: center; color: #F56C6C;' }, [
          h('i', { 
            class: 'el-icon-error', 
            style: 'margin-right: 8px; font-size: 16px;' 
          }),
          h('span', { style: 'font-weight: 500;' }, response.msg || '注册失败')
        ]),
        type: 'error',
        duration: 3000,
        showClose: true,
        center: true,
        customClass: 'custom-error-message'
      })
    }
  } catch (error) {
    console.error('Register error:', error)
    // 使用自定义样式的错误消息
    ElMessage({
      message: h('div', { style: 'display: flex; align-items: center; color: #F56C6C;' }, [
        h('i', { 
          class: 'el-icon-error', 
          style: 'margin-right: 8px; font-size: 16px;' 
        }),
        h('span', { style: 'font-weight: 500;' }, error.response?.data?.msg || '注册失败，请检查表单输入')
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

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h2>注册账号</h2>
        <p>Register for IOT Warehouse Management System</p>
      </div>

      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-position="top"
        class="register-form" status-icon>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" />
        </el-form-item>

        <el-form-item label="密码" prop="passwordHash">
          <el-input v-model="registerForm.passwordHash" type="password" show-password />
        </el-form-item>

        <el-form-item label="确认密码" prop="passwordConfirm">
          <el-input v-model="registerForm.passwordConfirm" type="password" show-password />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" />
        </el-form-item>

        <el-form-item label="生物识别令牌 (可选)" prop="biometricToken">
          <el-input v-model="registerForm.biometricToken" />
        </el-form-item>

        <el-form-item prop="agreeTerms">
          <el-checkbox v-model="registerForm.agreeTerms">
            我已阅读并同意 <a href="#">用户协议</a>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" class="register-button" @click="handleRegister">
            注册
          </el-button>
        </el-form-item>

        <div class="register-options">
          <span>已有账号? </span>
          <span class="login-link" @click="goToLogin">立即登录</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.register-box {
  width: 450px;
  padding: 40px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.register-header p {
  margin: 10px 0 0;
  font-size: 14px;
  color: #909399;
}

.register-form {
  margin-top: 20px;
}

.register-button {
  width: 100%;
}

.register-options {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #606266;
}

.login-link {
  color: #409eff;
  cursor: pointer;
}

.login-link:hover {
  text-decoration: underline;
}

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

/* 自定义消息弹窗样式 */
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

:deep(.el-form-item.is-error .el-input__validateIcon) {
  color: #F56C6C !important;
}

:deep(.el-form-item.is-success .el-input__validateIcon) {
  color: #67C23A !important;
}
</style>