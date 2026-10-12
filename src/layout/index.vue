<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="aside">
      <div class="logo">
        <el-icon :size="22" color="#409EFF"><VideoCamera /></el-icon>
        <span>海岸视频资源平台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="#a6adb4"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/videos">
          <el-icon><VideoCamera /></el-icon>
          <span>视频资源管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <span>工单管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部栏 -->
      <el-header class="header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="30" style="background-color: #409eff">
              {{ userStore.userInfo?.name?.charAt(0) }}
            </el-avatar>
            <span class="user-name">{{ userStore.userInfo?.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 工单详情页时高亮"审核工单"菜单
const activeMenu = computed(() => {
  if (route.path.startsWith('/orders')) return '/orders'
  return route.path
})

async function handleCommand(command) {
  if (command !== 'logout') return
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.layout {
  height: 100%;
}

.aside {
  background-color: #001529;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 60px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.aside :deep(.el-menu) {
  border-right: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.main {
  background-color: #f0f2f5;
  padding: 16px;
}
</style>
