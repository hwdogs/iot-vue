<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { goodsApi } from '../api/goods'

// 数据
const goodsList = ref([])
const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加商品')
const isEdit = ref(false)

// 表单数据
const goodsForm = reactive({
  goodsId: null,
  rfidTag: '',
  category: '',
  weight: null,
  expireDate: ''
})

// 搜索数据
const searchForm = reactive({
  rfidTag: '',
  category: '',
  expireDateBefore: '',
  expireDateAfter: '',
  pageNo: 1,
  pageSize: 10
})

// 表单规则
const rules = {
  rfidTag: [
    { required: true, message: '请输入RFID标签', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请输入商品类别', trigger: 'blur' }
  ],
  weight: [
    { required: true, message: '请输入重量', trigger: 'blur' },
    { type: 'number', message: '重量必须为数字', trigger: 'blur' }
  ],
  expireDate: [
    { required: true, message: '请选择过期日期', trigger: 'blur' }
  ]
}

// 表单引用
const goodsFormRef = ref(null)

// 商品类别选项
const categoryOptions = [
  { label: '食品', value: 'FOOD' },
  { label: '电子产品', value: 'ELECTRONICS' },
  { label: '衣物', value: 'CLOTHING' },
  { label: '日用品', value: 'DAILY_NECESSITIES' },
  { label: '其他', value: 'OTHER' }
]

// 获取商品列表
const fetchGoods = async () => {
  loading.value = true
  try {
    if (searchForm.rfidTag || searchForm.category || searchForm.expireDateBefore || searchForm.expireDateAfter) {
      // 使用条件搜索
      const response = await goodsApi.searchGoods(searchForm)
      goodsList.value = response.data || []
      total.value = response.total || goodsList.value.length
    } else {
      // 获取所有商品
      const response = await goodsApi.getAllGoods()
      goodsList.value = response.data || []
      total.value = goodsList.value.length
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  searchForm.pageNo = 1
  fetchGoods()
}

// 处理重置搜索
const handleResetSearch = () => {
  Object.assign(searchForm, {
    rfidTag: '',
    category: '',
    expireDateBefore: '',
    expireDateAfter: '',
    pageNo: 1,
    pageSize: 10
  })
  fetchGoods()
}

// 处理添加商品
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '添加商品'
  isEdit.value = false
  dialogVisible.value = true
}

// 处理编辑商品
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑商品'
  resetForm()
  Object.assign(goodsForm, row)
  dialogVisible.value = true
}

// 处理删除商品
const handleDelete = (goodsId) => {
  ElMessageBox.confirm('确定要删除此商品吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await goodsApi.deleteGoods(goodsId)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('删除成功')
        fetchGoods()
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
    }
  }).catch(() => {
    // User canceled
  })
}

// 提交表单
const submitForm = async () => {
  if (!goodsFormRef.value) return
  
  try {
    await goodsFormRef.value.validate()
    
    if (isEdit.value) {
      // 更新商品
      const response = await goodsApi.updateGoods(goodsForm)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchGoods()
      } else {
        ElMessage.error(response.msg || '更新失败')
      }
    } else {
      // 添加商品
      const response = await goodsApi.addGoods(goodsForm)
      if (response.code === 200 || response.code === 20000) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        fetchGoods()
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
  Object.assign(goodsForm, {
    goodsId: null,
    rfidTag: '',
    category: '',
    weight: null,
    expireDate: ''
  })
  // 重置验证
  if (goodsFormRef.value) {
    goodsFormRef.value.resetFields()
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  searchForm.pageNo = page
  fetchGoods()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  searchForm.pageSize = size
  searchForm.pageNo = 1
  fetchGoods()
}

// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// 组件挂载时加载数据
onMounted(() => {
  fetchGoods()
})
</script>

<template>
  <div class="container-fluid">
    <h1 class="page-title">商品管理</h1>
    
    <div class="content-wrapper">
      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <el-form :model="searchForm" :inline="true" class="search-form">
          <el-form-item label="RFID标签">
            <el-input v-model="searchForm.rfidTag" placeholder="请输入RFID标签" clearable />
          </el-form-item>
          
          <el-form-item label="商品类别">
            <el-select v-model="searchForm.category" placeholder="请选择商品类别" clearable>
              <el-option 
                v-for="item in categoryOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="过期日期">
            <el-date-picker
              v-model="searchForm.expireDateAfter"
              type="date"
              placeholder="起始日期"
              style="width: 160px"
              value-format="yyyy-MM-dd"
            />
            <span class="date-separator">至</span>
            <el-date-picker
              v-model="searchForm.expireDateBefore"
              type="date"
              placeholder="结束日期"
              style="width: 160px"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleResetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-wrapper">
        <el-button type="primary" @click="handleAdd">新增商品</el-button>
      </div>
      
      <!-- 商品表格 -->
      <div class="table-wrapper">
        <el-table
          :data="goodsList"
          v-loading="loading"
          border
          style="width: 100%"
        >
          <el-table-column prop="goodsId" label="ID" width="80" />
          <el-table-column prop="rfidTag" label="RFID标签" width="180" />
          <el-table-column prop="category" label="商品类别" width="120">
            <template #default="scope">
              <el-tag v-if="scope.row.category === 'FOOD'" type="success">食品</el-tag>
              <el-tag v-else-if="scope.row.category === 'ELECTRONICS'" type="warning">电子产品</el-tag>
              <el-tag v-else-if="scope.row.category === 'CLOTHING'" type="info">衣物</el-tag>
              <el-tag v-else-if="scope.row.category === 'DAILY_NECESSITIES'" type="primary">日用品</el-tag>
              <el-tag v-else>其他</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="weight" label="重量(kg)" width="100" />
          <el-table-column prop="expireDate" label="过期日期" width="150">
            <template #default="scope">
              {{ formatDate(scope.row.expireDate) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="handleDelete(scope.row.goodsId)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-if="total > 0"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="searchForm.pageSize"
          :current-page="searchForm.pageNo"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="goodsFormRef"
        :model="goodsForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="RFID标签" prop="rfidTag">
          <el-input v-model="goodsForm.rfidTag" />
        </el-form-item>
        
        <el-form-item label="商品类别" prop="category">
          <el-select v-model="goodsForm.category" placeholder="请选择商品类别">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="重量(kg)" prop="weight">
          <el-input-number v-model="goodsForm.weight" :min="0.01" :precision="2" :step="0.1" />
        </el-form-item>
        
        <el-form-item label="过期日期" prop="expireDate">
          <el-date-picker
            v-model="goodsForm.expireDate"
            type="date"
            placeholder="选择过期日期"
            style="width: 100%"
            value-format="yyyy-MM-dd"
          />
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
.date-separator {
  margin: 0 5px;
}

@media screen and (max-width: 768px) {
  .date-separator {
    display: block;
    margin: 10px 0;
    text-align: center;
  }
  
  :deep(.el-date-editor) {
    width: 100% !important;
  }
  
  :deep(.el-select) {
    width: 100%;
  }
}
</style> 