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
    // ȷ������passwordConfirm�ֶ�
    const registerData = {
      username: userData.username,
      passwordHash: userData.passwordHash,
      passwordConfirm: userData.passwordHash, // ʹ����ͬ����ֵ
      email: userData.email,
      biometricToken: userData.biometricToken,
      role: userData.role
    };
    console.log('����ע����������:', JSON.stringify(registerData));
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
    // ����һ��������������
    const params = {
      pageNo: searchData.pageNo || 1,
      pageSize: searchData.pageSize || 10
    }

    // ֻ�е�username��Ϊ��ʱ����Ӹò���
    if (searchData.username && searchData.username.trim() !== '') {
      params.username = searchData.username.trim()
    }

    // ֻ�е�role��Ϊ��ʱ����Ӹò���
    if (searchData.role && searchData.role !== '') {
      params.role = searchData.role
    }

    console.log('�����û�����:', JSON.stringify(params))
    return api.post('/user/getAllUserByCon', params)
  },

  updatePasswordByEmail: (email, password) => {
    return api.post('/user/updateByEmail', null, { params: { email, password } })
  }
} 