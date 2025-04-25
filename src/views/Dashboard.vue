<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { useUserStore } from '../store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const activeMenu = ref('')
const isCollapse = ref(false)
const screenWidth = ref(window.innerWidth)
const redirectInProgress = ref(false)

// 检查登录状态函数
const checkLoginStatus = () => {
  // 防止重复检查和循环重定向
  if (redirectInProgress.value) {
    return true;
  }
  
  console.log('Dashboard检查登录状态:', userStore.isLoggedIn);
  if (!userStore.isLoggedIn) {
    console.log('用户未登录，重定向到登录页');
    redirectInProgress.value = true;
    // 使用Vue Router而不是window.location
    router.push('/login');
    return false;
  }
  return true;
}

onMounted(() => {
  // 检查用户是否已登录
  if (!checkLoginStatus()) return;

  // 显示欢迎通知
  ElNotification({
    title: '欢迎回来',
    message: `${userStore.username || '用户'}，欢迎使用物联网智能仓库管理系统`,
    type: 'success',
    duration: 3000,
    position: 'top-right',
    customClass: 'success-notification'
  });

  // 更新活动菜单
  const path = router.currentRoute.value.path;
  const menuPath = path.split('/').slice(2).join('/');
  activeMenu.value = menuPath || 'warehouses';

  // 添加窗口大小监听
  window.addEventListener('resize', () => {
    screenWidth.value = window.innerWidth;
    if (screenWidth.value < 768) {
      isCollapse.value = true;
    } else {
      isCollapse.value = false;
    }
  });
});

// 监听路由变化，确保用户保持登录状态，但防止重复检查
watch(() => route.path, (newPath) => {
  console.log('Dashboard路由变化:', newPath);
  // 重置重定向状态
  redirectInProgress.value = false;
  checkLoginStatus();
});

// 从store获取用户信息
const userInfo = computed(() => userStore.userInfo);

// Menu selection handler
const handleSelect = (key) => {
  router.push(`/dashboard/${key}`);
}

// Logout handler
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout();
    // 清除检查标记，确保下次可以正常登录
    sessionStorage.removeItem('loginChecked');
    router.push('/login');
    ElMessage.success('已退出登录');
  }).catch(() => {
    // User cancelled
  });
}

// Toggle menu collapse state
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
}
</script>

<template>
  <el-container class="dashboard-container">
    <!-- Sidebar -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo-container">
        <h3 v-if="!isCollapse">物联网仓库管理</h3>
        <h3 v-else>IOT</h3>
      </div>

      <el-menu :default-active="activeMenu" class="el-menu-vertical" :collapse="isCollapse" @select="handleSelect"
        background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF">
        <el-menu-item index="users">
          <el-icon><i class="el-icon-user"></i></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>

        <el-menu-item index="warehouses">
          <el-icon><i class="el-icon-office-building"></i></el-icon>
          <template #title>仓库管理</template>
        </el-menu-item>

        <el-menu-item index="goods">
          <el-icon><i class="el-icon-goods"></i></el-icon>
          <template #title>商品管理</template>
        </el-menu-item>

        <el-menu-item index="shelves">
          <el-icon><i class="el-icon-sell"></i></el-icon>
          <template #title>货架管理</template>
        </el-menu-item>

        <el-menu-item index="devices">
          <el-icon><i class="el-icon-cpu"></i></el-icon>
          <template #title>设备管理</template>
        </el-menu-item>

        <el-menu-item index="inventory">
          <el-icon><i class="el-icon-box"></i></el-icon>
          <template #title>库存管理</template>
        </el-menu-item>

        <el-menu-item index="permissions">
          <el-icon><i class="el-icon-key"></i></el-icon>
          <template #title>权限管理</template>
        </el-menu-item>

        <el-menu-item index="environment">
          <el-icon><i class="el-icon-cloudy"></i></el-icon>
          <template #title>环境监控</template>
        </el-menu-item>

        <el-menu-item index="operation-logs">
          <el-icon><i class="el-icon-document"></i></el-icon>
          <template #title>操作日志</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- Main Content -->
    <el-container class="main-container">
      <!-- Header -->
      <el-header class="header">
        <div class="header-left">
          <el-button type="text" @click="toggleCollapse">
            <i class="el-icon-menu"></i>
          </el-button>
        </div>

        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-dropdown">
              {{ userInfo.username }}
              <i class="el-icon-arrow-down"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main Content Area -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.dashboard-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
  color: #fff;
  overflow: hidden;
}

.logo-container h3 {
  margin: 0;
  white-space: nowrap;
}

.el-menu-vertical {
  border-right: none;
  height: calc(100vh - 60px);
}

.header {
  height: 60px;
  line-height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.main-container {
  height: 100%;
  flex-direction: column;
}

.main-content {
  padding: 20px;
  background-color: #f5f7fa;
  height: calc(100vh - 60px);
  overflow-y: auto;
}
</style>