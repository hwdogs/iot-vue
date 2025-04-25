<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '../api/user'
import { 
  Plus, 
  Edit, 
  Delete, 
  Search, 
  Refresh
} from '@element-plus/icons-vue'

// Data
const userList = ref([])
const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const isEdit = ref(false)

// Form data
const userForm = reactive({
  userId: null,
  username: '',
  passwordHash: '',
  passwordConfirm: '',
  email: '',
  biometricToken: '',
  role: '2'
})

// Search data
const searchForm = reactive({
  username: '',
  role: '',
  pageNo: 1,
  pageSize: 10
})

// Form rules
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  passwordHash: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ],
  passwordConfirm: [
    { required: true, message: '请确认密码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// Reference to form
const userFormRef = ref(null)

// Role options - 更新角色选项
const roleOptions = [
  { label: '系统管理员', value: '0' },
  { label: '仓库管理员', value: '1' },
  { label: '供应链经理', value: '2' }
]

// 获取角色标签
const getRoleLabel = (role) => {
  const option = roleOptions.find(item => item.value === role)
  return option ? option.label : '未知角色'
}

// 获取角色标签类型
const getRoleType = (role) => {
  switch (role) {
    case '0': return 'danger'
    case '1': return 'warning'
    case '2': return 'success'
    default: return 'info'
  }
}

// Fetch user list
const fetchUsers = async () => {
  loading.value = true
  try {
    if (searchForm.username || searchForm.role) {
      // Search with conditions
      const response = await userApi.searchUsers(searchForm)
      userList.value = response.data || []
      total.value = response.total || userList.value.length
    } else {
      // Get all users
      const response = await userApi.getAllUsers()
      userList.value = response.data || []
      total.value = userList.value.length
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// Handle search
const handleSearch = () => {
  searchForm.pageNo = 1
  fetchUsers()
}

// Handle reset search
const handleResetSearch = () => {
  Object.assign(searchForm, {
    username: '',
    role: '',
    pageNo: 1,
    pageSize: 10
  })
  fetchUsers()
}

// Handle add user
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '添加用户'
  isEdit.value = false
  dialogVisible.value = true
}

// Handle edit user
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  resetForm()
  Object.assign(userForm, row)
  // Don't show passwords in edit mode
  userForm.passwordHash = ''
  userForm.passwordConfirm = ''
  dialogVisible.value = true
}

// Handle delete user
const handleDelete = (userId) => {
  ElMessageBox.confirm('确定要删除此用户吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await userApi.deleteUser(userId)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('删除成功')
        fetchUsers()
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      ElMessage.error('删除用户失败')
    }
  }).catch(() => {
    // User canceled
  })
}

// Handle submit form
const submitForm = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    
    if (isEdit.value) {
      // Update user
      const response = await userApi.updateUser(userForm)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchUsers()
      } else {
        ElMessage.error(response.msg || '更新失败')
      }
    } else {
      // Add user
      const response = await userApi.addUser(userForm)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        fetchUsers()
      } else {
        ElMessage.error(response.msg || '添加失败')
      }
    }
  } catch (error) {
    console.error('Form submission error:', error)
  }
}

// Reset form
const resetForm = () => {
  Object.assign(userForm, {
    userId: null,
    username: '',
    passwordHash: '',
    passwordConfirm: '',
    email: '',
    biometricToken: '',
    role: '2'
  })
  // Reset validation
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// Handle page change
const handlePageChange = (page) => {
  searchForm.pageNo = page
  fetchUsers()
}

// Handle page size change
const handleSizeChange = (size) => {
  searchForm.pageSize = size
  searchForm.pageNo = 1
  fetchUsers()
}

// Load data on component mount
onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="main-container">
    <div class="page-header">
      <h1>用户管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加用户
      </el-button>
    </div>
    
    <div class="content-area">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="角色">
            <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
              <el-option 
                v-for="item in roleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 查询
            </el-button>
            <el-button @click="handleResetSearch">
              <el-icon><Refresh /></el-icon> 重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格 -->
      <el-table
        :data="userList"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        class="data-table"
      >
        <el-table-column
          prop="userId"
          label="ID"
          width="80"
          align="center">
        </el-table-column>
        
        <el-table-column
          prop="username"
          label="用户名"
          width="120"
          align="center">
        </el-table-column>
        
        <el-table-column
          prop="email"
          label="邮箱"
          align="center">
        </el-table-column>
        
        <el-table-column
          prop="role"
          label="角色"
          width="150"
          align="center">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)" effect="light">
              {{ scope.row.role === 0 || scope.row.role === '0' ? '系统管理员' : 
                 scope.row.role === 1 || scope.row.role === '1' ? '仓库管理员' : 
                 scope.row.role === 2 || scope.row.role === '2' ? '供应链经理' : '未知角色' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          label="操作"
          width="220"
          fixed="right"
          align="center">
          <template #default="scope">
            <el-button type="primary" @click="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="danger" @click="handleDelete(scope.row.userId)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-area">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          :current-page="searchForm.pageNo"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="searchForm.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="550px"
      destroy-on-close>
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="rules"
        label-width="100px"
        status-icon>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        
        <el-form-item 
          label="密码" 
          prop="passwordHash"
          :rules="isEdit ? [] : rules.passwordHash">
          <el-input v-model="userForm.passwordHash" type="password" show-password placeholder="请输入密码"></el-input>
          <span v-if="isEdit" class="form-tip">不修改密码请留空</span>
        </el-form-item>
        
        <el-form-item 
          label="确认密码" 
          prop="passwordConfirm"
          :rules="isEdit ? [] : rules.passwordConfirm">
          <el-input v-model="userForm.passwordConfirm" type="password" show-password placeholder="请再次输入密码"></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        
        <el-form-item label="生物识别码" prop="biometricToken">
          <el-input v-model="userForm.biometricToken" placeholder="可选"></el-input>
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="userForm.role">
            <el-radio v-for="item in roleOptions" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.main-container {
  padding: 20px;
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 22px;
  color: #303133;
  font-weight: 600;
}

.content-area {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: calc(100vh - 180px);
}

.search-area {
  margin-bottom: 24px;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.data-table {
  margin-bottom: 24px;
  font-size: 14px;
  border-radius: 4px;
  overflow: hidden;
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 5px;
}

.el-button {
  font-size: 14px;
  margin-right: 8px;
}

.el-button + .el-button {
  margin-left: 8px;
}

:deep(.el-tag) {
  padding: 0 12px;
  font-size: 14px;
  height: 32px;
  line-height: 32px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  font-size: 15px;
  font-weight: 600;
  background-color: #f5f7fa;
}

:deep(.el-table--border) {
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 15px 20px;
  margin: 0;
  background-color: #f9f9f9;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #f0f0f0;
  padding: 15px 20px;
  margin: 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-icon) {
  margin-right: 4px;
  vertical-align: middle;
}

:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-header h1 {
    margin-bottom: 16px;
  }
  
  .el-form-item {
    margin-right: 0;
    margin-bottom: 16px;
    width: 100%;
  }
  
  .search-area .el-form {
    display: flex;
    flex-direction: column;
  }
  
  .el-button + .el-button {
    margin-left: 0;
    margin-top: 8px;
  }
}
</style> 