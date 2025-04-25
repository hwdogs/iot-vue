<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { warehouseApi } from '../api/warehouse'

// 数据
const warehouseList = ref([])
const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加仓库')
const isEdit = ref(false)

// 表单数据
const warehouseForm = reactive({
  warehouseId: null,
  name: '',
  location: '',
  area: null,
  environmentZone: ''
})

// 搜索数据
const searchForm = reactive({
  name: '',
  environmentZone: '',
  pageNo: 1,
  pageSize: 10
})

// 表单规则
const rules = {
  name: [
    { required: true, message: '请输入仓库名称', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入位置信息（格式：纬度 经度）', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请输入面积', trigger: 'blur' },
    { type: 'number', message: '面积必须为数字', trigger: 'blur' }
  ],
  environmentZone: [
    { required: true, message: '请输入环境区域', trigger: 'blur' }
  ]
}

// 表单引用
const warehouseFormRef = ref(null)

// 环境区域选项
const environmentZoneOptions = [
  { label: '温度控制区', value: 'TEMPERATURE_CONTROLLED' },
  { label: '高湿度区', value: 'HIGH_HUMIDITY' },
  { label: '低湿度区', value: 'LOW_HUMIDITY' },
  { label: '标准环境区', value: 'STANDARD' }
]

// 获取仓库列表
const fetchWarehouses = async () => {
  loading.value = true
  try {
    if (searchForm.name || searchForm.environmentZone) {
      // 使用条件搜索
      const response = await warehouseApi.searchWarehouses(searchForm)
      warehouseList.value = response.data || []
      total.value = response.total || warehouseList.value.length
    } else {
      // 获取所有仓库
      const response = await warehouseApi.getAllWarehouses()
      warehouseList.value = response.data || []
      total.value = warehouseList.value.length
    }
  } catch (error) {
    console.error('获取仓库列表失败:', error)
    ElMessage.error('获取仓库列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  searchForm.pageNo = 1
  fetchWarehouses()
}

// 处理重置搜索
const handleResetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    environmentZone: '',
    pageNo: 1,
    pageSize: 10
  })
  fetchWarehouses()
}

// 处理添加仓库
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '添加仓库'
  isEdit.value = false
  dialogVisible.value = true
}

// 处理编辑仓库
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑仓库'
  resetForm()
  Object.assign(warehouseForm, row)
  dialogVisible.value = true
}

// 处理删除仓库
const handleDelete = (warehouseId) => {
  ElMessageBox.confirm('确定要删除此仓库吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await warehouseApi.deleteWarehouse(warehouseId)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('删除成功')
        fetchWarehouses()
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除仓库失败:', error)
      ElMessage.error('删除仓库失败')
    }
  }).catch(() => {
    // User canceled
  })
}

// 提交表单
const submitForm = async () => {
  if (!warehouseFormRef.value) return
  
  try {
    await warehouseFormRef.value.validate()
    
    if (isEdit.value) {
      // 更新仓库
      const response = await warehouseApi.updateWarehouse(warehouseForm)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchWarehouses()
      } else {
        ElMessage.error(response.msg || '更新失败')
      }
    } else {
      // 添加仓库
      const response = await warehouseApi.addWarehouse(warehouseForm)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        fetchWarehouses()
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
  Object.assign(warehouseForm, {
    warehouseId: null,
    name: '',
    location: '',
    area: null,
    environmentZone: ''
  })
  // 重置验证
  if (warehouseFormRef.value) {
    warehouseFormRef.value.resetFields()
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  searchForm.pageNo = page
  fetchWarehouses()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  searchForm.pageSize = size
  searchForm.pageNo = 1
  fetchWarehouses()
}

// 组件挂载时加载数据
onMounted(() => {
  fetchWarehouses()
})
</script>

<template>
  <div class="warehouses-container">
    <h1>仓库管理</h1>
    
    <div class="content-area">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="仓库名称">
            <el-input v-model="searchForm.name" placeholder="请输入仓库名称"></el-input>
          </el-form-item>
          
          <el-form-item label="环境区域">
            <el-select v-model="searchForm.environmentZone" placeholder="请选择环境区域" clearable>
              <el-option 
                v-for="item in environmentZoneOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleResetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 操作按钮 -->
      <div class="operation-area">
        <el-button type="primary" @click="handleAdd">添加仓库</el-button>
      </div>
      
      <!-- 表格 -->
      <el-table
        :data="warehouseList"
        v-loading="loading"
        border
        style="width: 100%"
        class="data-table"
      >
        <el-table-column
          prop="warehouseId"
          label="ID"
          width="80">
        </el-table-column>
        
        <el-table-column
          prop="name"
          label="仓库名称"
          width="120">
        </el-table-column>
        
        <el-table-column
          prop="location"
          label="位置">
        </el-table-column>
        
        <el-table-column
          prop="area"
          label="面积(㎡)"
          width="100">
        </el-table-column>
        
        <el-table-column
          prop="environmentZone"
          label="环境区域"
          width="130">
          <template #default="scope">
            <el-tag v-if="scope.row.environmentZone === 'TEMPERATURE_CONTROLLED'" type="danger">温度控制区</el-tag>
            <el-tag v-else-if="scope.row.environmentZone === 'HIGH_HUMIDITY'" type="success">高湿度区</el-tag>
            <el-tag v-else-if="scope.row.environmentZone === 'LOW_HUMIDITY'" type="warning">低湿度区</el-tag>
            <el-tag v-else type="info">标准环境区</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          label="操作"
          width="180"
          fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.warehouseId)">删除</el-button>
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
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="40%">
      <el-form
        ref="warehouseFormRef"
        :model="warehouseForm"
        :rules="rules"
        label-width="100px">
        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="warehouseForm.name"></el-input>
        </el-form-item>
        
        <el-form-item label="位置" prop="location">
          <el-input v-model="warehouseForm.location" placeholder="格式：纬度 经度，如 31.2304 121.4737"></el-input>
        </el-form-item>
        
        <el-form-item label="面积" prop="area">
          <el-input-number v-model="warehouseForm.area" :min="1" :precision="2" style="width: 100%"></el-input-number>
        </el-form-item>
        
        <el-form-item label="环境区域" prop="environmentZone">
          <el-select v-model="warehouseForm.environmentZone" placeholder="请选择环境区域" style="width: 100%">
            <el-option 
              v-for="item in environmentZoneOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
.warehouses-container {
  padding: 20px;
  height: 100%;
}

.content-area {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 180px);
}

.search-area {
  margin-bottom: 20px;
}

.operation-area {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.data-table {
  margin-bottom: 20px;
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 