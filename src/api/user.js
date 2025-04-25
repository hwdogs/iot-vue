import api from './index'

export const userApi = {
  getAllUsers: () => {
    return api.get('/user/getAllUsers')
  },

  login: (userData) => {
    // Ensure the data is in the correct format with exact field names
    const loginData = {
      username: userData.username,
      password: userData.password
    };
    console.log('Sending login request with data:', JSON.stringify(loginData));
    return api.post('/user/login', loginData)
  },

  register: (userData) => {
    // 确保包含passwordConfirm字段
    const registerData = {
      username: userData.username,
      passwordHash: userData.passwordHash,
      passwordConfirm: userData.passwordHash, // 使用相同密码值
      email: userData.email,
      biometricToken: userData.biometricToken,
      role: userData.role
    };
    console.log('发送注册请求数据:', JSON.stringify(registerData));
    return api.post('/user/register', registerData);
  },

  addUser: (userData) => {
    return api.post('/user/addUser', userData)
  },

  updateUser: (userData) => {
    return api.post('/user/updateUser', userData)
  },

  deleteUser: (userId) => {
    return api.post('/user/delUser', null, { params: { userId } })
  },

  searchUsers: (searchData) => {
    // 创建一个基础参数对象
    const params = {
      pageNo: searchData.pageNo || 1,
      pageSize: searchData.pageSize || 10
    }

    // 只有当username不为空时才添加该参数
    if (searchData.username && searchData.username.trim() !== '') {
      params.username = searchData.username.trim()
    }

    // 只有当role不为空时才添加该参数
    if (searchData.role && searchData.role !== '') {
      params.role = searchData.role
    }

    console.log('搜索用户参数:', JSON.stringify(params))
    return api.post('/user/getAllUserByCon', params)
  },

  updatePasswordByEmail: (email, password) => {
    return api.post('/user/updateByEmail', null, { params: { email, password } })
  }
} 