<template>
  <div class="operation-logs-container">
    <div class="page-title">
      <h1>操作日志</h1>
    </div>
    
    <div class="content-area">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="操作类型">
            <el-select v-model="searchForm.operationType" placeholder="选择操作类型" clearable>
              <el-option label="入库" value="入库"></el-option>
              <el-option label="出库" value="出库"></el-option>
              <el-option label="移动" value="移动"></el-option>
              <el-option label="清点" value="清点"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="操作时间">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            >
              <template #prefix>
                <el-icon><Calendar /></el-icon>
              </template>
            </el-date-picker>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 查询
            </el-button>
            <el-button @click="resetForm">
              <el-icon><Refresh /></el-icon> 重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格 -->
      <el-table
        :data="logsList"
        border
        style="width: 100%"
        v-loading="loading"
        stripe
        class="data-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column prop="logId" label="ID" width="80" min-width="80" align="center"></el-table-column>
        <el-table-column prop="operationType" label="操作类型" width="120" min-width="120" align="center"></el-table-column>
        <el-table-column prop="timestamp" label="操作时间" width="180" min-width="180" align="center"></el-table-column>
        <el-table-column prop="goodsId" label="商品ID" width="120" min-width="120" align="center"></el-table-column>
        <el-table-column prop="deviceId" label="设备ID" width="120" min-width="120" align="center"></el-table-column>
        <el-table-column prop="operatorId" label="操作人ID" width="120" min-width="120" align="center"></el-table-column>
        <el-table-column label="操作" width="180" min-width="180" fixed="right" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button size="small" type="primary" @click="handleDetail(scope.row)">
                <el-icon><Document /></el-icon> 详情
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-area">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="pagination.pageNo"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>
    
    <!-- 详情弹窗 -->
    <el-dialog title="操作日志详情" v-model="dialogVisible" width="50%">
      <div v-if="currentLog">
        <div class="log-detail-item">
          <span class="label">日志ID：</span>
          <span>{{ currentLog.logId }}</span>
        </div>
        <div class="log-detail-item">
          <span class="label">操作类型：</span>
          <span>{{ currentLog.operationType }}</span>
        </div>
        <div class="log-detail-item">
          <span class="label">操作时间：</span>
          <span>{{ currentLog.timestamp }}</span>
        </div>
        <div class="log-detail-item">
          <span class="label">商品ID：</span>
          <span>{{ currentLog.goodsId }}</span>
        </div>
        <div class="log-detail-item">
          <span class="label">设备ID：</span>
          <span>{{ currentLog.deviceId }}</span>
        </div>
        <div class="log-detail-item">
          <span class="label">操作人ID：</span>
          <span>{{ currentLog.operatorId }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Calendar, Document, Delete } from '@element-plus/icons-vue'

export default {
  name: 'OperationLogs',
  setup() {
    const logsList = ref([])
    const loading = ref(false)
    const dialogVisible = ref(false)
    const currentLog = ref(null)
    
    const searchForm = reactive({
      operationType: '',
      timeRange: []
    })
    
    const pagination = reactive({
      pageNo: 1,
      pageSize: 10,
      total: 0
    })
    
    const fetchLogs = async () => {
      loading.value = true
      try {
        // 模拟API请求数据
        // 实际项目中应替换为真实API调用
        // const res = await fetch('/api/operationLog/getAllOperationLogsByCon', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     operationType: searchForm.operationType,
        //     timestampStart: searchForm.timeRange[0],
        //     timestampEnd: searchForm.timeRange[1],
        //     pageNo: pagination.pageNo,
        //     pageSize: pagination.pageSize
        //   })
        // })
        // const data = await res.json()
        
        // 模拟数据
        const mockData = []
        for (let i = 1; i <= 10; i++) {
          mockData.push({
            logId: i,
            operationType: ['入库', '出库', '移动', '清点'][Math.floor(Math.random() * 4)],
            timestamp: new Date().toLocaleString(),
            goodsId: Math.floor(Math.random() * 1000),
            deviceId: Math.floor(Math.random() * 100),
            operatorId: Math.floor(Math.random() * 50)
          })
        }
        
        setTimeout(() => {
          logsList.value = mockData
          pagination.total = 100 // 模拟总数
          loading.value = false
        }, 500)
      } catch (error) {
        console.error('获取操作日志失败:', error)
        ElMessage.error('获取操作日志失败')
        loading.value = false
      }
    }
    
    const handleSearch = () => {
      pagination.pageNo = 1
      fetchLogs()
    }
    
    const resetForm = () => {
      searchForm.operationType = ''
      searchForm.timeRange = []
      handleSearch()
    }
    
    const handleSizeChange = (size) => {
      pagination.pageSize = size
      fetchLogs()
    }
    
    const handleCurrentChange = (page) => {
      pagination.pageNo = page
      fetchLogs()
    }
    
    const handleDetail = (row) => {
      currentLog.value = row
      dialogVisible.value = true
    }
    
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确认删除ID为 ${row.logId} 的操作日志记录吗？`,
        '警告',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 这里应调用真实的删除API
        // await deleteLog(row.logId)
        ElMessage.success('删除成功')
        fetchLogs()
      }).catch(() => {
        // 取消删除
      })
    }
    
    onMounted(() => {
      fetchLogs()
    })
    
    return {
      logsList,
      loading,
      searchForm,
      pagination,
      dialogVisible,
      currentLog,
      handleSearch,
      resetForm,
      handleSizeChange,
      handleCurrentChange,
      handleDetail,
      handleDelete
    }
  }
}
</script>

<style scoped>
.operation-logs-container {
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

.content-area {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: calc(100vh - 180px);
}

.search-area {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
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

.log-detail-item {
  margin-bottom: 10px;
  display: flex;
}

.log-detail-item .label {
  font-weight: bold;
  width: 100px;
}

@media (max-width: 768px) {
  .operation-logs-container {
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
  
  :deep(.el-date-editor) {
    width: 100% !important;
  }
}
</style> 