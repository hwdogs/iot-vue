<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { shelfApi } from '../api/shelf'
import { warehouseApi } from '../api/warehouse'

// 数据
const shelfList = ref([])
const warehouseList = ref([])
const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加货架')
const isEdit = ref(false)

// 表单数据
const shelfForm = reactive({
  shelfId: null,
  warehouseId: null,
  positionX: null,
  positionY: null,
  positionZ: null,
  capacity: null
})

// 搜索数据
const searchForm = reactive({
  warehouseId: '',
  capacityMin: '',
  capacityMax: '',
  pageNo: 1,
  pageSize: 10
})

// 表单规则
const rules = {
  warehouseId: [
    { required: true, message: '请选择所属仓库', trigger: 'change' }
  ],
  positionX: [
    { required: true, message: '请输入X坐标', trigger: 'blur' },
    { type: 'number', message: 'X坐标必须为数字', trigger: 'blur' }
  ],
  positionY: [
    { required: true, message: '请输入Y坐标', trigger: 'blur' },
    { type: 'number', message: 'Y坐标必须为数字', trigger: 'blur' }
  ],
  positionZ: [
    { required: true, message: '请输入Z坐标', trigger: 'blur' },
    { type: 'number', message: 'Z坐标必须为数字', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: '请输入容量', trigger: 'blur' },
    { type: 'number', message: '容量必须为数字', trigger: 'blur' }
  ]
}

// 表单引用
const shelfFormRef = ref(null)

// 获取所有仓库
const fetchWarehouses = async () => {
  try {
    const response = await warehouseApi.getAllWarehouses()
    warehouseList.value = response.data || []
  } catch (error) {
    console.error('获取仓库列表失败:', error)
    ElMessage.error('获取仓库列表失败')
  }
}

// 获取货架列表
const fetchShelves = async () => {
  loading.value = true
  try {
    if (searchForm.warehouseId || searchForm.capacityMin || searchForm.capacityMax) {
      // 使用条件搜索
      const response = await shelfApi.searchShelves(searchForm)
      shelfList.value = response.data || []
      total.value = response.total || shelfList.value.length
    } else {
      // 获取所有货架
      const response = await shelfApi.getAllShelves()
      shelfList.value = response.data || []
      total.value = shelfList.value.length
    }
  } catch (error) {
    console.error('获取货架列表失败:', error)
    ElMessage.error('获取货架列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  searchForm.pageNo = 1
  fetchShelves()
}

// 处理重置搜索
const handleResetSearch = () => {
  Object.assign(searchForm, {
    warehouseId: '',
    capacityMin: '',
    capacityMax: '',
    pageNo: 1,
    pageSize: 10
  })
  fetchShelves()
}

// 处理添加货架
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '添加货架'
  isEdit.value = false
  dialogVisible.value = true
}

// 处理编辑货架
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑货架'
  resetForm()
  Object.assign(shelfForm, row)
  dialogVisible.value = true
}

// 处理删除货架
const handleDelete = (shelfId) => {
  ElMessageBox.confirm('确定要删除此货架吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await shelfApi.deleteShelf(shelfId)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        fetchShelves()
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除货架失败:', error)
      ElMessage.error('删除货架失败')
    }
  }).catch(() => {
    // User canceled
  })
}

// 提交表单
const submitForm = async () => {
  if (!shelfFormRef.value) return

  try {
    await shelfFormRef.value.validate()

    if (isEdit.value) {
      // 更新货架
      const response = await shelfApi.updateShelf(shelfForm)
      if (response.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchShelves()
      } else {
        ElMessage.error(response.msg || '更新失败')
      }
    } else {
      // 添加货架
      const response = await shelfApi.addShelf(shelfForm)
      if (response.code === 200) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        fetchShelves()
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
  Object.assign(shelfForm, {
    shelfId: null,
    warehouseId: null,
    positionX: null,
    positionY: null,
    positionZ: null,
    capacity: null
  })
  // 重置验证
  if (shelfFormRef.value) {
    shelfFormRef.value.resetFields()
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  searchForm.pageNo = page
  fetchShelves()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  searchForm.pageSize = size
  searchForm.pageNo = 1
  fetchShelves()
}

// 获取仓库名称
const getWarehouseName = (warehouseId) => {
  const warehouse = warehouseList.value.find(w => w.warehouseId === warehouseId)
  return warehouse ? warehouse.name : '未知仓库'
}

// 组件挂载时加载数据
onMounted(() => {
  fetchWarehouses()
  fetchShelves()
})
</script>

<template>
  <div class="container-fluid">
    <h1 class="page-title">货架管理</h1>

    <div class="content-wrapper">
      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <el-form :model="searchForm" :inline="true" class="search-form">
          <el-form-item label="所属仓库">
            <el-select v-model="searchForm.warehouseId" placeholder="请选择仓库" clearable>
              <el-option v-for="item in warehouseList" :key="item.warehouseId" :label="item.name"
                :value="item.warehouseId" />
            </el-select>
          </el-form-item>

          <el-form-item label="容量范围">
            <el-input-number v-model="searchForm.capacityMin" :min="0" placeholder="最小容量" style="width: 120px" />
            <span class="range-separator">至</span>
            <el-input-number v-model="searchForm.capacityMax" :min="0" placeholder="最大容量" style="width: 120px" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleResetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="action-wrapper">
        <el-button type="primary" @click="handleAdd">新增货架</el-button>
      </div>

      <!-- 货架表格 -->
      <div class="table-wrapper">
        <el-table :data="shelfList" v-loading="loading" border style="width: 100%">
          <el-table-column prop="shelfId" label="ID" width="80" />
          <el-table-column label="所属仓库" width="150">
            <template #default="scope">
              {{ getWarehouseName(scope.row.warehouseId) }}
            </template>
          </el-table-column>
          <el-table-column label="位置" width="180">
            <template #default="scope">
              X: {{ scope.row.positionX }}, Y: {{ scope.row.positionY }}, Z: {{ scope.row.positionZ }}
            </template>
          </el-table-column>
          <el-table-column prop="capacity" label="容量" width="100" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row.shelfId)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-if="total > 0" background layout="total, sizes, prev, pager, next, jumper" :total="total"
          :page-size="searchForm.pageSize" :current-page="searchForm.pageNo" :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" @close="resetForm">
      <el-form ref="shelfFormRef" :model="shelfForm" :rules="rules" label-width="100px">
        <el-form-item label="所属仓库" prop="warehouseId">
          <el-select v-model="shelfForm.warehouseId" placeholder="请选择仓库">
            <el-option v-for="item in warehouseList" :key="item.warehouseId" :label="item.name"
              :value="item.warehouseId" />
          </el-select>
        </el-form-item>

        <el-form-item label="X坐标" prop="positionX">
          <el-input-number v-model="shelfForm.positionX" :min="0" />
        </el-form-item>

        <el-form-item label="Y坐标" prop="positionY">
          <el-input-number v-model="shelfForm.positionY" :min="0" />
        </el-form-item>

        <el-form-item label="Z坐标" prop="positionZ">
          <el-input-number v-model="shelfForm.positionZ" :min="0" />
        </el-form-item>

        <el-form-item label="容量" prop="capacity">
          <el-input-number v-model="shelfForm.capacity" :min="1" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.range-separator {
  margin: 0 5px;
}

.container-fluid {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.content-wrapper {
  width: 100%;
  box-sizing: border-box;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.search-wrapper,
.action-wrapper,
.pagination-wrapper {
  margin-bottom: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}

@media screen and (max-width: 768px) {
  .range-separator {
    display: block;
    margin: 10px 0;
    text-align: center;
  }

  :deep(.el-input-number) {
    width: 100% !important;
  }

  :deep(.el-select) {
    width: 100%;
  }

  .container-fluid {
    padding: 10px;
  }
}
</style>