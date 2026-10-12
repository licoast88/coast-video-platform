import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '数据看板' }
      },
      {
        path: 'videos',
        name: 'VideoList',
        component: () => import('@/views/video/VideoList.vue'),
        meta: { title: '视频资源管理' }
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('@/views/order/OrderList.vue'),
        meta: { title: '工单管理' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局路由守卫：未登录跳转登录页
router.beforeEach((to) => {
  const token = localStorage.getItem('cvp_token')
  if (to.path !== '/login' && !token) {
    return { path: '/login', query: to.path === '/' ? {} : { redirect: to.fullPath } }
  }
  if (to.path === '/login' && token) {
    return '/dashboard'
  }
  document.title = to.meta.title ? `${to.meta.title} - 海岸视频资源平台` : '海岸视频资源平台'
})

export default router
