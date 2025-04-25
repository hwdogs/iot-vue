import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard/warehouses'
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'warehouses',
        name: 'Warehouses',
        component: () => import('../views/Warehouses.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'goods',
        name: 'Goods',
        component: () => import('../views/Goods.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'shelves',
        name: 'Shelves',
        component: () => import('../views/Shelves.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'devices',
        name: 'Devices',
        component: () => import('../views/Devices.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('../views/Inventory.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'permissions',
        name: 'Permissions',
        component: () => import('../views/Permissions.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'environment',
        name: 'Environment',
        component: () => import('../views/Environment.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'operation-logs',
        name: 'OperationLogs',
        component: () => import('../views/OperationLogs.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  // 捕获所有未匹配的路由，重定向到登录页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 解决路由循环重定向问题
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', from.path, '->', to.path);

  // 获取当前用户登录状态
  const isLoggedIn = !!localStorage.getItem('token');
  console.log('当前登录状态:', isLoggedIn ? '已登录' : '未登录');

  // 处理可能的循环重定向问题
  if (from.path === to.path) {
    console.log('检测到重复导航，直接放行');
    next();
    return;
  }

  // 检查是否从登录/注册页重定向，防止循环
  const isAuthRoute = to.path === '/login' || to.path === '/register';
  const fromAuthRoute = from.path === '/login' || from.path === '/register';

  if (isAuthRoute && fromAuthRoute && from.path !== to.path) {
    console.log('在认证页面之间导航');
    next();
    return;
  }

  // 访问需要认证的页面但未登录
  if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    console.log('未登录用户访问需要认证的页面，重定向到登录页');
    next('/login');
    return;
  }

  // 已登录用户访问登录/注册页面，重定向到仪表盘
  if (isLoggedIn && isAuthRoute) {
    console.log('已登录用户访问登录/注册页，重定向到仪表盘');
    next('/dashboard/warehouses');
    return;
  }

  // 其他情况正常放行
  console.log('正常放行:', to.path);
  next();
})

export default router 