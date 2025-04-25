<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { warehouseApi } from '../api/warehouse'
import { 
  Plus, 
  Edit, 
  Delete, 
  Search, 
  Refresh 
} from '@element-plus/icons-vue'

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
  environmentZone: '常温区'
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
    { required: true, message: '请输入位置信息', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请输入面积', trigger: 'blur' },
    { type: 'number', message: '面积必须为数字', trigger: 'blur' }
  ],
  environmentZone: [
    { required: true, message: '请选择环境区域', trigger: 'change' }
  ]
}

// 表单引用
const warehouseFormRef = ref(null)

// 环境区域选项
const environmentZoneOptions = [
  { label: '常温区', value: '常温区' },
  { label: '冷链区', value: '冷链区' },
  { label: '危险品区', value: '危险品区' }
]

// 获取环境区域标签
const getZoneLabel = (zone) => {
  const option = environmentZoneOptions.find(item => item.value === zone)
  return option ? option.label : zone // 如果找不到匹配的选项，直接返回原值
}

// 获取环境区域标签类型
const getZoneType = (zone) => {
  switch(zone) {
    case '常温区': return 'info'
    case '冷链区': return 'primary'
    case '危险品区': return 'danger'
    default: return 'info' // 默认使用info类型
  }
}

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
  console.log('编辑仓库数据:', row)
  Object.assign(warehouseForm, row)
  console.log('编辑表单数据:', warehouseForm)
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
    
    console.log('提交表单数据:', JSON.stringify(warehouseForm))
    
    if (isEdit.value) {
      // 更新仓库
      const response = await warehouseApi.updateWarehouse(warehouseForm)
      console.log('更新仓库响应:', response)
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
      console.log('添加仓库响应:', response)
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
    environmentZone: '常温区'
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

// 监听environmentZone变化
watch(() => searchForm.environmentZone, (newVal, oldVal) => {
  console.log('环境区域选择变化:', {
    newValue: newVal,
    oldValue: oldVal
  })
})

// 组件挂载时加载数据
onMounted(() => {
  fetchWarehouses()
})
</script>

<template>
  <div class="warehouses-container">
    <div class="page-title">
      <h1>仓库管理</h1>
    </div>
    <div class="add-warehouse-button">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加仓库
      </el-button>
    </div>
    
    <div class="content-area">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="仓库名称">
            <el-input v-model="searchForm.name" placeholder="请输入仓库名称" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="环境区域">
            <el-select 
              v-model="searchForm.environmentZone" 
              placeholder="请选择环境区域" 
              clearable
              popper-class="zone-select-dropdown"
              :teleported="false">
              <template #prefix v-if="searchForm.environmentZone">
                <el-tag size="small" effect="plain" class="selected-zone-tag">
                  {{ getZoneLabel(searchForm.environmentZone) }}
                </el-tag>
              </template>
              <el-option 
                v-for="item in environmentZoneOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                <div class="zone-option-container">
                  <el-tag 
                    :type="getZoneType(item.value)" 
                    effect="light" 
                    size="small" 
                    class="zone-tag">
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
        <div class="current-filters" v-if="searchForm.name || searchForm.environmentZone">
          <span class="filter-label">当前筛选:</span>
          <el-tag 
            v-if="searchForm.name" 
            size="small" 
            effect="light" 
            class="filter-tag" 
            closable
            @close="searchForm.name = ''; handleSearch()">
            仓库名称: {{ searchForm.name }}
          </el-tag>
          <el-tag 
            v-if="searchForm.environmentZone" 
            size="small" 
            :type="getZoneType(searchForm.environmentZone)"
            effect="light" 
            class="filter-tag" 
            closable
            @close="searchForm.environmentZone = ''; handleSearch()">
            环境区域: {{ getZoneLabel(searchForm.environmentZone) }}
          </el-tag>
        </div>
      </div>
      
      <!-- 表格 -->
      <el-table
        :data="warehouseList"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        class="data-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column
          prop="warehouseId"
          label="ID"
          width="80"
          min-width="80"
          align="center">
        </el-table-column>
        
        <el-table-column
          prop="name"
          label="仓库名称"
          width="120"
          min-width="120"
          align="center">
        </el-table-column>
        
        <el-table-column
          prop="location"
          label="位置"
          min-width="180"
          align="center"
          show-overflow-tooltip>
        </el-table-column>
        
        <el-table-column
          prop="area"
          label="面积(㎡)"
          width="100"
          min-width="100"
          align="center">
        </el-table-column>
        
        <el-table-column
          prop="environmentZone"
          label="环境区域"
          width="130"
          min-width="130"
          align="center">
          <template #default="scope">
            <el-tag :type="getZoneType(scope.row.environmentZone)" effect="light">
              {{ getZoneLabel(scope.row.environmentZone) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          label="操作"
          width="180"
          min-width="180"
          fixed="right"
          align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row.warehouseId)">
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
          <el-input v-model="warehouseForm.location" placeholder="请输入位置信息"></el-input>
        </el-form-item>
        
        <el-form-item label="面积" prop="area">
          <el-input-number v-model="warehouseForm.area" :min="1" :precision="2" style="width: 100%"></el-input-number>
        </el-form-item>
        
        <el-form-item label="环境区域" prop="environmentZone">
          <el-radio-group v-model="warehouseForm.environmentZone">
            <el-radio v-for="item in environmentZoneOptions" :key="item.value" :label="item.value">
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
.warehouses-container {
  padding: 20px;
  height: calc(100vh - 60px);
}

.page-title {
  margin-bottom: 16px;
  font-size: 22px;
  color: #303133;
}

.page-title h1 {
  margin: 0;
  font-size: 22px;
  color: #303133;
  font-weight: 600;
}

.add-warehouse-button {
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

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 环境区域选择相关样式 */
.zone-option-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
}

.zone-tag {
  margin-right: 5px;
  min-width: 80px;
  text-align: center;
}

.selected-zone-tag {
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

/* 高亮当前选中的区域 */
:deep(.el-select-dropdown__item.selected) {
  background-color: var(--el-fill-color-light);
  font-weight: normal;
}

:deep(.el-select-dropdown__item.selected .zone-tag) {
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

@media (max-width: 768px) {
  .warehouses-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .search-area {
    flex-direction: column;
    align-items: flex-start;
  }
  
  :deep(.el-select) {
    width: 100%;
  }
}
</style> 