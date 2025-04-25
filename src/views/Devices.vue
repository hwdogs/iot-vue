<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deviceApi } from '../api/device'
import { 
  Plus, 
  Edit, 
  Delete, 
  Search, 
  Refresh,
  Tools,
  Calendar
} from '@element-plus/icons-vue'

// 数据
const deviceList = ref([])
const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加设备')
const isEdit = ref(false)

// 表单数据
const deviceForm = reactive({
  deviceId: null,
  type: '',
  status: '',
  lastMaintenance: ''
})

// 搜索数据
const searchForm = reactive({
  type: '',
  status: '',
  lastMaintenanceAfter: '',
  lastMaintenanceBefore: '',
  pageNo: 1,
  pageSize: 10
})

// 表单规则
const rules = {
  type: [
    { required: true, message: '请输入设备类型', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择设备状态', trigger: 'change' }
  ],
  lastMaintenance: [
    { required: true, message: '请选择最后维护日期', trigger: 'blur' }
  ]
}

// 表单引用
const deviceFormRef = ref(null)

// 设备类型选项
const deviceTypeOptions = [
  { label: 'RFID读取器', value: 'RFID_READER' },
  { label: '温度传感器', value: 'TEMPERATURE_SENSOR' },
  { label: '湿度传感器', value: 'HUMIDITY_SENSOR' },
  { label: '机器人', value: 'ROBOT' },
  { label: '安全摄像头', value: 'SECURITY_CAMERA' }
]

// 设备状态选项
const deviceStatusOptions = [
  { label: '正常运行', value: 'RUNNING' },
  { label: '维护中', value: 'MAINTENANCE' },
  { label: '故障', value: 'FAILURE' },
  { label: '离线', value: 'OFFLINE' }
]

// 获取设备列表
const fetchDevices = async () => {
  loading.value = true
  try {
    if (searchForm.type || searchForm.status || searchForm.lastMaintenanceAfter || searchForm.lastMaintenanceBefore) {
      // 使用条件搜索
      const response = await deviceApi.searchDevices(searchForm)
      deviceList.value = response.data || []
      total.value = response.total || deviceList.value.length
    } else {
      // 获取所有设备
      const response = await deviceApi.getAllDevices()
      deviceList.value = response.data || []
      total.value = deviceList.value.length
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
    ElMessage.error('获取设备列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  searchForm.pageNo = 1
  fetchDevices()
}

// 处理重置搜索
const handleResetSearch = () => {
  Object.assign(searchForm, {
    type: '',
    status: '',
    lastMaintenanceAfter: '',
    lastMaintenanceBefore: '',
    pageNo: 1,
    pageSize: 10
  })
  fetchDevices()
}

// 处理添加设备
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '添加设备'
  isEdit.value = false
  dialogVisible.value = true
}

// 处理编辑设备
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑设备'
  resetForm()
  Object.assign(deviceForm, row)
  dialogVisible.value = true
}

// 处理删除设备
const handleDelete = (deviceId) => {
  ElMessageBox.confirm('确定要删除此设备吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deviceApi.deleteDevice(deviceId)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('删除成功')
        fetchDevices()
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除设备失败:', error)
      ElMessage.error('删除设备失败')
    }
  }).catch(() => {
    // User canceled
  })
}

// 提交表单
const submitForm = async () => {
  if (!deviceFormRef.value) return
  
  try {
    await deviceFormRef.value.validate()
    
    if (isEdit.value) {
      // 更新设备
      const response = await deviceApi.updateDevice(deviceForm)
      if (response.code === 200 || response.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchDevices()
      } else {
        ElMessage.error(response.msg || '更新失败')
      }
    } else {
      // 添加设备
      const response = await deviceApi.addDevice(deviceForm)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        fetchDevices()
      } else {
        ElMessage.error(response.msg || '添加失败')
      }
    }
  } catch (error) {
    console.error('表单提交错误:', error)
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(deviceForm, {
    deviceId: null,
    type: '',
    status: '',
    lastMaintenance: ''
  })
  // 重置验证
  if (deviceFormRef.value) {
    deviceFormRef.value.resetFields()
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  searchForm.pageNo = page
  fetchDevices()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  searchForm.pageSize = size
  searchForm.pageNo = 1
  fetchDevices()
}

// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// 获取设备类型显示名称
const getTypeLabel = (type) => {
  const option = deviceTypeOptions.find(item => item.value === type)
  return option ? option.label : type
}

// 获取状态标签类型
const getStatusType = (status) => {
  switch(status) {
    case 'RUNNING': return 'success'
    case 'MAINTENANCE': return 'warning'
    case 'FAILURE': return 'danger'
    case 'OFFLINE': return 'info'
    default: return ''
  }
}

// 获取状态显示名称
const getStatusLabel = (status) => {
  const option = deviceStatusOptions.find(item => item.value === status)
  return option ? option.label : status
}

// 组件挂载时加载数据
onMounted(() => {
  fetchDevices()
})
</script>

<template>
  <div class="devices-container">
    <div class="page-title">
      <h1>设备管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加设备
      </el-button>
    </div>
    
    <div class="content-area">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="设备类型">
            <el-select v-model="searchForm.type" placeholder="请选择设备类型" clearable>
              <el-option 
                v-for="item in deviceTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="设备状态">
            <el-select v-model="searchForm.status" placeholder="请选择设备状态" clearable>
              <el-option 
                v-for="item in deviceStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="维护日期">
            <el-date-picker
              v-model="searchForm.lastMaintenanceAfter"
              type="date"
              placeholder="维护日期开始"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD">
              <template #prefix>
                <el-icon><Calendar /></el-icon>
              </template>
            </el-date-picker>
          </el-form-item>
          
          <el-form-item label="至">
            <el-date-picker
              v-model="searchForm.lastMaintenanceBefore"
              type="date"
              placeholder="维护日期结束"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD">
              <template #prefix>
                <el-icon><Calendar /></el-icon>
              </template>
            </el-date-picker>
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
        :data="deviceList"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        class="data-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column
          prop="deviceId"
          label="ID"
          min-width="70"
          width="70"
          align="center">
        </el-table-column>
        
        <el-table-column
          prop="type"
          label="设备类型"
          min-width="150"
          width="150"
          align="center"
          show-overflow-tooltip>
          <template #default="scope">
            {{ getTypeLabel(scope.row.type) }}
          </template>
        </el-table-column>
        
        <el-table-column
          prop="status"
          label="状态"
          min-width="110"
          width="110"
          align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="light">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="lastMaintenance"
          label="最后维护日期"
          min-width="180"
          align="center"
          show-overflow-tooltip>
          <template #default="scope">
            <div class="date-cell">
              {{ formatDate(scope.row.lastMaintenance) }}
            </div>
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
              <el-button type="danger" size="small" @click="handleDelete(scope.row.deviceId)">
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
        ref="deviceFormRef"
        :model="deviceForm"
        :rules="rules"
        label-width="100px"
        status-icon>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="deviceForm.type" placeholder="请选择设备类型" style="width: 100%">
            <el-option 
              v-for="item in deviceTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="设备状态" prop="status">
          <el-select v-model="deviceForm.status" placeholder="请选择设备状态" style="width: 100%">
            <el-option 
              v-for="item in deviceStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="维护日期" prop="lastMaintenance">
          <el-date-picker
            v-model="deviceForm.lastMaintenance"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%">
            <template #prefix>
              <el-icon><Calendar /></el-icon>
            </template>
          </el-date-picker>
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
.devices-container {
  padding: 20px;
  height: calc(100vh - 60px);
}

.page-title {
  margin-bottom: 20px;
  font-size: 22px;
  color: #303133;
}

.page-title h1 {
  margin: 0;
  font-size: 22px;
  color: #303133;
  font-weight: 600;
}

.search-area {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
}

.add-button {
  margin-left: auto;
}

.data-table {
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

:deep(.el-table__header-wrapper) {
  padding: 12px 0;
  font-size: 14px;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped) {
  background-color: #f9fafc;
}

:deep(.el-table__row) {
  height: 60px;
}

:deep(.el-table__fixed-right) {
  height: 100% !important;
}

.date-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

:deep(.el-button--small) {
  padding: 8px 12px;
  font-size: 12px;
  height: 32px;
  line-height: 16px;
}

@media (max-width: 768px) {
  .devices-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .search-area {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .add-button {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style> 