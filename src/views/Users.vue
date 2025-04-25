<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
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
  // 确保role是字符串类型
  const roleStr = String(role)
  const option = roleOptions.find(item => item.value === roleStr)
  return option ? option.label : '未知角色'
}

// 获取角色标签类型
const getRoleType = (role) => {
  // 确保role是字符串类型
  const roleStr = String(role)
  switch (roleStr) {
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
    let response
    // 只有当username或role有实际值时才执行搜索，否则获取所有用户
    const hasUsername = searchForm.username && searchForm.username.trim() !== ''
    const hasRole = searchForm.role && searchForm.role !== ''
    
    if (hasUsername || hasRole) {
      // 搜索时显示调试信息
      console.log('执行搜索，条件:', JSON.stringify({
        username: hasUsername ? searchForm.username : '未设置',
        role: hasRole ? searchForm.role : '未设置',
        pageNo: searchForm.pageNo,
        pageSize: searchForm.pageSize
      }))
      // Search with conditions
      response = await userApi.searchUsers(searchForm)
    } else {
      // Get all users with pagination parameters
      response = await userApi.getAllUsers({
        pageNo: searchForm.pageNo,
        pageSize: searchForm.pageSize
      })
    }

    // 统一处理响应结果
    console.log('获取到的数据:', response)
    
    // 检查响应格式并提取数据
    if (response.data && Array.isArray(response.data)) {
      userList.value = response.data.map(user => ({
        ...user,
        role: user.role !== undefined ? String(user.role) : user.role
      }))
    } else if (response.data && response.data.records && Array.isArray(response.data.records)) {
      // 处理可能的分页格式
      userList.value = response.data.records.map(user => ({
        ...user,
        role: user.role !== undefined ? String(user.role) : user.role
      }))
      total.value = response.data.total || 0
    } else {
      // 尝试直接使用响应
      userList.value = Array.isArray(response) ? response.map(user => ({
        ...user,
        role: user.role !== undefined ? String(user.role) : user.role
      })) : []
    }
    
    // 设置总数
    if (response.total) {
      total.value = response.total
    } else if (response.data && response.data.total) {
      total.value = response.data.total
    } else if (!total.value) {
      total.value = userList.value.length
    }
    
    // 如果数据为空但有总数，可能是分页问题，尝试回到第一页
    if (userList.value.length === 0 && total.value > 0 && searchForm.pageNo > 1) {
      searchForm.pageNo = 1
      await fetchUsers()
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    ElMessage.error('获取用户列表失败')
    userList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// Handle search
const handleSearch = () => {
  // 重置到第一页
  searchForm.pageNo = 1
  fetchUsers()
}

// Handle reset search
const handleResetSearch = () => {
  // 完全重置搜索条件
  searchForm.username = ''
  searchForm.role = ''
  searchForm.pageNo = 1
  searchForm.pageSize = 10
  
  // 获取所有用户数据
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
  
  // 复制并确保role是字符串类型
  const userData = {...row}
  if (userData.role !== undefined) {
    userData.role = String(userData.role)
  }
  
  console.log('编辑用户数据:', userData)
  Object.assign(userForm, userData)
  
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
        // 重置到第一页并刷新数据
        searchForm.pageNo = 1
        await fetchUsers()
      } else {
        ElMessage.error(response.msg || '更新失败')
      }
    } else {
      // Add user
      const response = await userApi.addUser(userForm)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        // 重置搜索条件，确保能看到新添加的用户
        Object.assign(searchForm, {
          username: '',
          role: '',
          pageNo: 1,
          pageSize: 10
        })
        await fetchUsers()
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

// 监听role变化
watch(() => searchForm.role, (newVal, oldVal) => {
  console.log('角色选择变化:', {
    newValue: newVal,
    oldValue: oldVal,
    valueType: typeof newVal
  })
})

// 监听userForm.role变化
watch(() => userForm.role, (newVal, oldVal) => {
  console.log('编辑用户角色变化:', {
    newValue: newVal,
    oldValue: oldVal,
    valueType: typeof newVal
  })
})
</script>

<template>
  <div class="main-container">
    <div class="page-header">
      <h1>用户管理</h1>
    </div>
    <div class="add-user-button">
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
            <el-select 
              v-model="searchForm.role" 
              placeholder="请选择角色" 
              clearable
              popper-class="role-select-dropdown"
              :teleported="false">
              <template #prefix v-if="searchForm.role">
                <el-tag size="small" effect="plain" class="selected-role-tag">
                  {{ getRoleLabel(searchForm.role) }}
                </el-tag>
              </template>
              <el-option 
                v-for="item in roleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                <div class="role-option-container">
                  <el-tag 
                    :type="getRoleType(item.value)" 
                    effect="light" 
                    size="small" 
                    class="role-tag">
                    {{ item.label }}
                  </el-tag>
                </div>
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
        
        <!-- 当前筛选条件提示 -->
        <div class="current-filters" v-if="searchForm.username || searchForm.role">
          <span class="filter-label">当前筛选:</span>
          <el-tag 
            v-if="searchForm.username" 
            size="small" 
            effect="light" 
            class="filter-tag" 
            closable
            @close="searchForm.username = ''; handleSearch()">
            用户名: {{ searchForm.username }}
          </el-tag>
          <el-tag 
            v-if="searchForm.role" 
            size="small" 
            :type="getRoleType(searchForm.role)"
            effect="light" 
            class="filter-tag" 
            closable
            @close="searchForm.role = ''; handleSearch()">
            角色: {{ getRoleLabel(searchForm.role) }}
          </el-tag>
        </div>
      </div>
      
      <!-- 表格 -->
      <el-table
        :data="userList"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        class="data-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column
          prop="userId"
          label="ID"
          min-width="70"
          width="70"
          align="center">
        </el-table-column>
        
        <el-table-column
          prop="username"
          label="用户名"
          min-width="120"
          width="120"
          align="center"
          show-overflow-tooltip>
        </el-table-column>
        
        <el-table-column
          prop="email"
          label="邮箱"
          min-width="200"
          align="center"
          show-overflow-tooltip>
          <!-- <template #default="scope">
            <div class="email-cell">
              <el-tooltip 
                :content="scope.row.email" 
                placement="top" 
                :hide-after="1500">
                <span class="email-text">{{ scope.row.email }}</span>
              </el-tooltip>
            </div>
          </template> -->
        </el-table-column>
        
        <el-table-column
          prop="role"
          label="角色"
          min-width="110"
          width="110"
          align="center">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)" effect="light">
              {{ getRoleLabel(String(scope.row.role)) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          label="操作"
          min-width="180"
          width="180"
          align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row.userId)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
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
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h1 {
  margin: 0;
  font-size: 22px;
  color: #303133;
  font-weight: 600;
}

.add-user-button {
  margin-bottom: 16px;
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
  border-radius: 8px;
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
  overflow: hidden;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #f9fafc;
}

:deep(.el-table__fixed-right) {
  height: 100% !important;
}

:deep(.el-table th) {
  padding: 12px 0;
  font-size: 14px;
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

/* 角色选择相关样式 */
.role-option-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
}

.role-tag {
  margin-right: 5px;
  min-width: 80px;
  text-align: center;
}

.selected-role-tag {
  margin-right: 8px;
  font-size: 12px;
}

:deep(.el-select .el-input__inner) {
  padding-left: 15px;
}

:deep(.el-select-dropdown__item) {
  padding: 0 20px;
}

:deep(.el-select .el-input__wrapper) {
  padding-right: 30px;
}

:deep(.el-select .el-input__inner) {
  cursor: pointer;
}

/* 高亮当前选中的角色 */
:deep(.el-select-dropdown__item.selected) {
  background-color: var(--el-fill-color-light);
  font-weight: normal;
}

:deep(.el-select-dropdown__item.selected .role-tag) {
  font-weight: bold;
}

/* 当前筛选条件样式 */
.current-filters {
  display: flex;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
}

.filter-label {
  color: var(--el-text-color-secondary);
  margin-right: 10px;
  font-size: 13px;
}

.filter-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

/* 表格相关样式 */
.data-table {
  margin-bottom: 24px;
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__row) {
  height: 60px;
}

.email-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.email-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: inline-block;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

:deep(.el-button.el-button--small) {
  padding: 6px 10px;
  font-size: 12px;
  height: 32px;
}

:deep(.el-table .cell) {
  word-break: break-word;
  line-height: 1.5;
  padding: 0 8px;
}
</style> 