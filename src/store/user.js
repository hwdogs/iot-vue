import { defineStore } from 'pinia'
import { userApi } from '../api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('user') || '{}')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo.username || '',
    userRole: (state) => state.userInfo.role || ''
  },

  actions: {
    // Login action
    async login(username, password) {
      try {
        const response = await userApi.login(username, password)

        if (response.code === 200 || response.code === 20000) {
          this.token = response.data.token || 'mock-token'
          this.userInfo = response.data

          // Save to localStorage
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.userInfo))

          return { success: true, data: response.data }
        } else {
          return { success: false, message: response.msg || '登录失败' }
        }
      } catch (error) {
        console.error('Login error:', error)
        return { success: false, message: error.response?.data?.msg || '登录失败，请检查网络连接' }
      }
    },

    // Logout action
    logout() {
      this.token = ''
      this.userInfo = {}
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    // Register action
    async register(userData) {
      try {
        const response = await userApi.register(userData)

        if (response.code === 200) {
          return { success: true, message: '注册成功' }
        } else {
          return { success: false, message: response.msg || '注册失败' }
        }
      } catch (error) {
        console.error('Register error:', error)
        return { success: false, message: error.response?.data?.msg || '注册失败' }
      }
    },

    // Update user info
    async updateUserInfo(userInfo) {
      try {
        const response = await userApi.updateUser(userInfo)

        if (response.code === 200) {
          // If updating current user, update store
          if (userInfo.userId === this.userInfo.userId) {
            this.userInfo = { ...this.userInfo, ...userInfo }
            localStorage.setItem('user', JSON.stringify(this.userInfo))
          }

          return { success: true, message: '更新成功' }
        } else {
          return { success: false, message: response.msg || '更新失败' }
        }
      } catch (error) {
        console.error('Update user error:', error)
        return { success: false, message: error.response?.data?.msg || '更新用户信息失败' }
      }
    },

    // 直接设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      this.token = userInfo.token || this.token

      // 保存到localStorage
      localStorage.setItem('user', JSON.stringify(this.userInfo))
      if (userInfo.token) {
        localStorage.setItem('token', userInfo.token)
      }
    }
  }
}) 