<template>
  <div class="container-fluid">
    <h1 class="page-title">Environment Monitoring</h1>
    
    <div class="content-wrapper">
      <!-- Stats Cards -->
      <div class="stats-cards">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>Average Temperature</span>
            </div>
          </template>
          <div class="stat-value">{{ avgTemperature }}°C</div>
        </el-card>
        
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>Average Humidity</span>
            </div>
          </template>
          <div class="stat-value">{{ avgHumidity }}%</div>
        </el-card>
        
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>Most Common Air Quality</span>
            </div>
          </template>
          <div class="stat-value">{{ mostCommonAirQuality }}</div>
        </el-card>
      </div>
      
      <!-- Action Bar -->
      <div class="action-wrapper">
        <el-button type="primary" @click="showAddDialog">Add Sensor Data</el-button>
        
        <div class="search-box">
          <el-input
            v-model="searchSensorId"
            placeholder="Search by Sensor ID"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <i class="el-icon-search"></i>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
      
      <!-- Data Table -->
      <div class="table-wrapper">
        <el-table
          v-loading="loading"
          :data="environmentData"
          style="width: 100%"
          border
        >
          <el-table-column prop="sensorId" label="Sensor ID" width="120" />
          <el-table-column prop="temperature" label="Temperature (°C)" width="150" />
          <el-table-column prop="humidity" label="Humidity (%)" width="150" />
          <el-table-column prop="airQuality" label="Air Quality" width="150" />
          <el-table-column prop="timestamp" label="Timestamp" width="200">
            <template #default="scope">
              {{ formatDate(scope.row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column label="Operations" width="150">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(scope.row)"
                >Edit</el-button
              >
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
                >Delete</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- Pagination -->
      <div class="pagination-wrapper">
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
        <el-form-item label="Sensor ID" prop="sensorId">
          <el-input v-model="form.sensorId" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="Temperature" prop="temperature">
          <el-input v-model.number="form.temperature" type="number">
            <template #append>°C</template>
          </el-input>
        </el-form-item>
        <el-form-item label="Humidity" prop="humidity">
          <el-input v-model.number="form.humidity" type="number">
            <template #append>%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="Air Quality" prop="airQuality">
          <el-select v-model="form.airQuality" placeholder="Select Air Quality">
            <el-option label="Good" value="Good"></el-option>
            <el-option label="Moderate" value="Moderate"></el-option>
            <el-option label="Poor" value="Poor"></el-option>
            <el-option label="Unhealthy" value="Unhealthy"></el-option>
            <el-option label="Hazardous" value="Hazardous"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitForm">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
        { required: true, message: 'Please input sensor ID', trigger: 'blur' }
      ],
      temperature: [
        { required: true, message: 'Please input temperature', trigger: 'blur' },
        { type: 'number', message: 'Temperature must be a number', trigger: 'blur' }
      ],
      humidity: [
        { required: true, message: 'Please input humidity', trigger: 'blur' },
        { type: 'number', message: 'Humidity must be a number', trigger: 'blur' },
        { min: 0, max: 100, message: 'Humidity must be between 0 and 100', trigger: 'blur' }
      ],
      airQuality: [
        { required: true, message: 'Please select air quality', trigger: 'change' }
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
        console.error('Error fetching environment data:', error)
        ElMessage.error('Failed to fetch environment data')
      } finally {
        loading.value = false
      }
    }
    
    const fetchStats = async () => {
      try {
        const response = await getEnvironmentStats()
        statsData.value = response.data
      } catch (error) {
        console.error('Error fetching environment stats:', error)
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
        console.error('Error searching environment data:', error)
        ElMessage.error('Failed to search environment data')
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
      dialogTitle.value = 'Add Sensor Data'
      isEdit.value = false
      dialogVisible.value = true
    }
    
    const handleEdit = (row) => {
      form.sensorId = row.sensorId
      form.temperature = row.temperature
      form.humidity = row.humidity
      form.airQuality = row.airQuality
      form.timestamp = row.timestamp
      dialogTitle.value = 'Edit Sensor Data'
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
              ElMessage.success('Environment data updated successfully')
            } else {
              await addEnvironment(form)
              ElMessage.success('Environment data added successfully')
            }
            dialogVisible.value = false
            fetchEnvironmentData()
          } catch (error) {
            console.error('Error saving environment data:', error)
            ElMessage.error('Failed to save environment data')
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `Are you sure you want to delete data for sensor ${row.sensorId}?`,
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(async () => {
          loading.value = true
          try {
            await deleteEnvironment(row.sensorId, row.timestamp)
            ElMessage.success('Environment data deleted successfully')
            fetchEnvironmentData()
          } catch (error) {
            console.error('Error deleting environment data:', error)
            ElMessage.error('Failed to delete environment data')
          } finally {
            loading.value = false
          }
        })
        .catch(() => {
          ElMessage.info('Delete cancelled')
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

.search-box {
  width: 300px;
}

@media screen and (max-width: 992px) {
  .stat-card {
    width: 48%;
  }
}

@media screen and (max-width: 768px) {
  .stat-card {
    width: 100%;
  }
  
  .search-box {
    width: 100%;
    margin-top: 10px;
  }
  
  .action-wrapper {
    flex-direction: column;
  }
}
</style> 