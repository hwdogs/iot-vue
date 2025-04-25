<template>
  <div class="inventory-container">
    <h1>库存管理</h1>
    <div class="content-area">
      <div class="placeholder-content">
        <el-empty description="库存管理功能正在开发中..." />
        <p class="placeholder-tip">该功能将很快推出，敬请期待！</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inventory-container {
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

.placeholder-content {
  padding: 40px;
  text-align: center;
}

.placeholder-tip {
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}
</style> 