<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-title">
        <el-icon :size="38" color="#409EFF"><VideoCamera /></el-icon>
        <h2>海岸视频资源平台</h2>
        <p>Coastal Video Resource Management Platform</p>
      </div>
      <el-alert
        v-if="errorMsg"
        :title="errorMsg"
        type="error"
        show-icon
        :closable="false"
        style="margin-bottom: 18px"
      />
      <el-form ref="formRef" :model="form" :rules="rules" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-tip">演示账号：admin　密码：123456</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const errorMsg = ref('')
const form = reactive({
  username: 'admin',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  await formRef.value.validate()
  loading.value = true
  errorMsg.value = ''
  try {
    await userStore.login({ ...form })
    ElMessage.success('登录成功')
    router.push(route.query.redirect || '/dashboard')
  } catch (e) {
    errorMsg.value = e.message || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #1c3faa 0%, #2b6cb0 45%, #38b2ac 100%);
}

.login-card {
  width: 400px;
  padding: 40px 36px 28px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.login-title {
  margin-bottom: 24px;
  text-align: center;
}

.login-title h2 {
  margin-top: 8px;
  font-size: 22px;
  color: #303133;
}

.login-title p {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.login-tip {
  text-align: center;
  font-size: 13px;
  color: #909399;
}
</style>
