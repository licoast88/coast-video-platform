<template>
  <div class="page-card">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索工单号 / 视频标题"
        clearable
        style="width: 240px"
        :prefix-icon="Search"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
        <el-option v-for="s in ORDER_STATUS" :key="s" :label="s" :value="s" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
      <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      <el-button type="success" :icon="Plus" style="margin-left: auto" @click="openCreate">
        创建工单
      </el-button>
    </div>

    <!-- 工单列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="orderNo" label="工单编号" width="170" />
      <el-table-column prop="videoTitle" label="关联视频" min-width="220" show-overflow-tooltip />
      <el-table-column prop="problemType" label="问题类型" width="100" align="center" />
      <el-table-column prop="priority" label="优先级" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="priorityType(row.priority)" size="small">{{ row.priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" effect="dark" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="creator" label="创建人" width="100" align="center" />
      <el-table-column prop="handler" label="处理人" width="100" align="center">
        <template #default="{ row }">{{ row.handler || '-' }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="150" />
      <el-table-column prop="updateTime" label="更新时间" width="150" />
      <el-table-column label="操作" width="90" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            v-if="row.status !== '已完成'"
            type="primary"
            link
            @click="handleAdvance(row)"
          >
            {{ row.status === '待处理' ? '接单' : '完成' }}
          </el-button>
          <span v-else style="color:#c0c4cc">—</span>
        </template>
      </el-table-column>
      <template #empty>暂无工单数据</template>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <!-- 创建工单弹窗 -->
    <el-dialog v-model="dialogVisible" title="创建工单" width="560px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="视频资源" prop="videoId">
          <el-select
            v-model="form.videoId"
            placeholder="请选择视频资源"
            filterable
            style="width: 100%"
            :loading="videoLoading"
          >
            <el-option
              v-for="v in videoOptions"
              :key="v.id"
              :label="`[${v.category}] ${v.title}`"
              :value="v.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="问题类型" prop="problemType">
          <el-select v-model="form.problemType" placeholder="请选择" style="width: 100%">
            <el-option v-for="p in PROBLEM_TYPES" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="form.priority">
            <el-radio-button label="高" />
            <el-radio-button label="中" />
            <el-radio-button label="低" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请描述具体问题，如画面异常时间段、音频缺失等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getOrderPage, createOrder, advanceOrderStatus } from '@/api/order'
import { getAllVideos } from '@/api/video'
import { ORDER_STATUS, PROBLEM_TYPES } from '@/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10, keyword: '', status: '' })

async function loadData() {
  loading.value = true
  try {
    const data = await getOrderPage({ ...query })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  loadData()
}

function handleReset() {
  query.keyword = ''
  query.status = ''
  handleSearch()
}

// 优先级标签样式
function priorityType(p) {
  return { 高: 'danger', 中: 'warning', 低: 'success' }[p] || 'info'
}

// 状态标签样式
function statusType(s) {
  return { 待处理: 'warning', 处理中: 'primary', 已完成: 'success' }[s] || 'info'
}

// 状态流转
async function handleAdvance(row) {
  const action = row.status === '待处理' ? '接单处理' : '标记完成'
  await ElMessageBox.confirm(`确定将该工单「${action}」吗？`, '提示', { type: 'warning' })
  await advanceOrderStatus(row.id)
  ElMessage.success('状态更新成功')
  loadData()
}

// ---------- 创建工单 ----------
const dialogVisible = ref(false)
const videoLoading = ref(false)
const submitting = ref(false)
const videoOptions = ref([])
const formRef = ref(null)
const form = reactive({
  videoId: '',
  problemType: '',
  priority: '中',
  description: ''
})

const rules = {
  videoId: [{ required: true, message: '请选择视频资源', trigger: 'change' }],
  problemType: [{ required: true, message: '请选择问题类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  description: [{ required: true, message: '请填写问题描述', trigger: 'blur' }]
}

async function openCreate() {
  dialogVisible.value = true
  videoLoading.value = true
  formRef.value?.resetFields()
  try {
    videoOptions.value = await getAllVideos()
  } finally {
    videoLoading.value = false
  }
}

async function submitCreate() {
  await formRef.value.validate()
  submitting.value = true
  try {
    await createOrder({ ...form })
    ElMessage.success('工单创建成功')
    dialogVisible.value = false
    handleSearch()
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>
