<template>
  <div class="environment-container">
    <div class="page-title">
      <h1>环境监控</h1>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon> 添加传感器数据
      </el-button>
    </div>
    
    <div class="content-area">
      <!-- Stats Cards -->
      <div class="stats-cards">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>平均温度</span>
            </div>
          </template>
          <div class="stat-value">{{ avgTemperature }}°C</div>
        </el-card>
        
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>平均湿度</span>
            </div>
          </template>
          <div class="stat-value">{{ avgHumidity }}%</div>
        </el-card>
        
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>最常见空气质量</span>
            </div>
          </template>
          <div class="stat-value">{{ mostCommonAirQuality }}</div>
        </el-card>
      </div>
      
      <!-- Action Bar -->
      <div class="search-area">
        <div class="search-box">
          <el-input
            v-model="searchSensorId"
            placeholder="按传感器ID搜索"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 查询
        </el-button>
      </div>
      
      <!-- Data Table -->
      <el-table
        v-loading="loading"
        :data="environmentData"
        style="width: 100%"
        border
        stripe
        class="data-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column prop="sensorId" label="传感器ID" width="120" min-width="120" align="center" />
        <el-table-column prop="temperature" label="温度 (°C)" width="150" min-width="150" align="center" />
        <el-table-column prop="humidity" label="湿度 (%)" width="150" min-width="150" align="center" />
        <el-table-column prop="airQuality" label="空气质量" width="150" min-width="150" align="center" />
        <el-table-column prop="timestamp" label="时间戳" min-width="200" align="center">
          <template #default="scope">
            <div class="date-cell">
              {{ formatDate(scope.row.timestamp) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" min-width="180" fixed="right" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(scope.row)"
                ><el-icon><Edit /></el-icon> 编辑</el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
                ><el-icon><Delete /></el-icon> 删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Pagination -->
      <div class="pagination-area">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
        />
      </div>
    </div>
    
    <!-- Add/Edit Dialog -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="传感器ID" prop="sensorId">
          <el-input v-model="form.sensorId" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="温度" prop="temperature">
          <el-input v-model.number="form.temperature" type="number">
            <template #append>°C</template>
          </el-input>
        </el-form-item>
        <el-form-item label="湿度" prop="humidity">
          <el-input v-model.number="form.humidity" type="number">
            <template #append>%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="空气质量" prop="airQuality">
          <el-select v-model="form.airQuality" placeholder="选择空气质量">
            <el-option label="良好" value="Good"></el-option>
            <el-option label="一般" value="Moderate"></el-option>
            <el-option label="差" value="Poor"></el-option>
            <el-option label="不健康" value="Unhealthy"></el-option>
            <el-option label="有害" value="Hazardous"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { 
  getAllEnvironments, 
  searchEnvironments, 
  addEnvironment, 
  updateEnvironment, 
  deleteEnvironment,
  getEnvironmentStats
} from '../api/environment'

export default {
  name: 'Environment',
  setup() {
    // Data
    const loading = ref(false)
    const environmentData = ref([])
    const searchSensorId = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalItems = ref(0)
    const statsData = ref({
      avgTemperature: 0,
      avgHumidity: 0,
      mostCommonAirQuality: 'N/A'
    })
    
    // Dialog
    const dialogVisible = ref(false)
    const dialogTitle = ref('Add Sensor Data')
    const isEdit = ref(false)
    const form = reactive({
      sensorId: '',
      temperature: 0,
      humidity: 0,
      airQuality: 'Good',
      timestamp: ''
    })
    const rules = {
      sensorId: [
        { required: true, message: '请输入传感器ID', trigger: 'blur' }
      ],
      temperature: [
        { required: true, message: '请输入温度值', trigger: 'blur' },
        { type: 'number', message: '温度必须为数字', trigger: 'blur' }
      ],
      humidity: [
        { required: true, message: '请输入湿度值', trigger: 'blur' },
        { type: 'number', message: '湿度必须为数字', trigger: 'blur' },
        { min: 0, max: 100, message: '湿度值必须在0到100之间', trigger: 'blur' }
      ],
      airQuality: [
        { required: true, message: '请选择空气质量', trigger: 'change' }
      ]
    }
    const formRef = ref(null)
    
    // Computed properties
    const avgTemperature = computed(() => {
      return statsData.value.avgTemperature.toFixed(1)
    })
    
    const avgHumidity = computed(() => {
      return statsData.value.avgHumidity.toFixed(1)
    })
    
    const mostCommonAirQuality = computed(() => {
      return statsData.value.mostCommonAirQuality
    })
    
    // Methods
    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A'
      const date = new Date(timestamp)
      return date.toLocaleString()
    }
    
    const fetchEnvironmentData = async () => {
      loading.value = true
      try {
        const response = await getAllEnvironments()
        environmentData.value = response.data
        totalItems.value = response.data.length
        fetchStats()
      } catch (error) {
        console.error('获取环境数据失败:', error)
        ElMessage.error('获取环境数据失败')
      } finally {
        loading.value = false
      }
    }
    
    const fetchStats = async () => {
      try {
        const response = await getEnvironmentStats()
        statsData.value = response.data
      } catch (error) {
        console.error('获取环境统计数据失败:', error)
      }
    }
    
    const handleSearch = async () => {
      loading.value = true
      try {
        if (searchSensorId.value.trim() === '') {
          await fetchEnvironmentData()
          return
        }
        
        const params = { sensorId: searchSensorId.value }
        const response = await searchEnvironments(params)
        environmentData.value = response.data
        totalItems.value = response.data.length
      } catch (error) {
        console.error('搜索环境数据失败:', error)
        ElMessage.error('搜索环境数据失败')
      } finally {
        loading.value = false
      }
    }
    
    const handleSizeChange = (size) => {
      pageSize.value = size
      fetchEnvironmentData()
    }
    
    const handleCurrentChange = (page) => {
      currentPage.value = page
      fetchEnvironmentData()
    }
    
    const resetForm = () => {
      form.sensorId = ''
      form.temperature = 0
      form.humidity = 0
      form.airQuality = 'Good'
      form.timestamp = ''
    }
    
    const showAddDialog = () => {
      resetForm()
      dialogTitle.value = '添加传感器数据'
      isEdit.value = false
      dialogVisible.value = true
    }
    
    const handleEdit = (row) => {
      form.sensorId = row.sensorId
      form.temperature = row.temperature
      form.humidity = row.humidity
      form.airQuality = row.airQuality
      form.timestamp = row.timestamp
      dialogTitle.value = '编辑传感器数据'
      isEdit.value = true
      dialogVisible.value = true
    }
    
    const submitForm = async () => {
      formRef.value?.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            if (isEdit.value) {
              await updateEnvironment(form)
              ElMessage.success('更新成功')
            } else {
              await addEnvironment(form)
              ElMessage.success('添加成功')
            }
            dialogVisible.value = false
            fetchEnvironmentData()
          } catch (error) {
            console.error('保存环境数据失败:', error)
            ElMessage.error('保存数据失败')
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除传感器 ${row.sensorId} 的数据吗？`,
        '警告',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(async () => {
          loading.value = true
          try {
            await deleteEnvironment(row.sensorId, row.timestamp)
            ElMessage.success('删除成功')
            fetchEnvironmentData()
          } catch (error) {
            console.error('删除环境数据失败:', error)
            ElMessage.error('删除数据失败')
          } finally {
            loading.value = false
          }
        })
        .catch(() => {
          ElMessage.info('已取消删除')
        })
    }
    
    // Lifecycle hooks
    onMounted(() => {
      fetchEnvironmentData()
    })
    
    return {
      loading,
      environmentData,
      searchSensorId,
      currentPage,
      pageSize,
      totalItems,
      dialogVisible,
      dialogTitle,
      isEdit,
      form,
      rules,
      formRef,
      avgTemperature,
      avgHumidity,
      mostCommonAirQuality,
      formatDate,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      showAddDialog,
      handleEdit,
      handleDelete,
      submitForm
    }
  }
}
</script>

<style scoped>
.environment-container {
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

.stats-cards {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-card {
  width: 32%;
  margin-bottom: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  padding: 10px 0;
}

.search-area {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
}

.search-box {
  flex: 1;
  min-width: 200px;
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

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .environment-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .stat-card {
    width: 100%;
  }
  
  .search-area {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-box {
    width: 100%;
  }
}
</style> 