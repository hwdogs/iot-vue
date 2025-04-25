<template>
  <div class="permissions-container">
    <div class="page-title">
      <h1>权限管理</h1>
    </div>
    
    <div class="content-area">
      <div class="placeholder-content">
        <el-empty description="权限管理功能正在开发中..." />
        <p class="placeholder-tip">该功能将很快推出，敬请期待！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 页面数据和方法
const permissions = ref([])

onMounted(() => {
  // 页面加载时初始化数据
  console.log('权限管理页面已加载')
})
</script>

<style scoped>
.permissions-container {
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

.placeholder-content {
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 280px);
}

.placeholder-tip {
  margin-top: 20px;
  color: #909399;
  font-size: 16px;
}

@media (max-width: 768px) {
  .permissions-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .placeholder-content {
    padding: 20px;
  }
}
</style> 