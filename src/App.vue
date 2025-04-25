<script setup>
// App.vue is now just a shell for the router
</script>

<template>
  <div class="app-container">
  <router-view />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

html {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.app-container {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.container {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 22px;
  font-weight: bold;
}
</style>
