<template>
  <div class="page-card">
    <!-- 筛选栏：关键字（标题/拍摄地点/标签）+ 分类 -->
    <div class="filter-bar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索标题 / 拍摄地点 / 标签"
        clearable
        style="width: 260px"
        :prefix-icon="Search"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select v-model="query.category" placeholder="全部分类" clearable style="width: 160px">
        <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
      <el-button :icon="Refresh" @click="handleReset">重置</el-button>
    </div>

    <!-- 视频资源列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column type="index" label="#" width="50" align="center" />
      <el-table-column prop="title" label="视频标题" min-width="220" show-overflow-tooltip />
      <el-table-column prop="category" label="所属分类" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="categoryTagType(row.category)" effect="light">{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="拍摄地点" width="140" />
      <el-table-column label="标签" width="180">
        <template #default="{ row }">
          <el-tag
            v-for="t in row.tags"
            :key="t"
            size="small"
            effect="plain"
            style="margin-right: 4px"
          >
            {{ t }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时长" width="100" align="center">
        <template #default="{ row }">{{ formatDuration(row.duration) }}</template>
      </el-table-column>
      <el-table-column prop="resolution" label="分辨率" width="110" align="center" />
      <el-table-column prop="shootTime" label="拍摄时间" width="150" />
      <el-table-column label="操作" width="90" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="openDetail(row)">详情</el-button>
        </template>
      </el-table-column>
      <template #empty>暂无视频资源</template>
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

    <!-- 视频详情抽屉 -->
    <el-drawer v-model="drawerVisible" size="560px" :title="detail?.title || '视频详情'">
      <div v-loading="detailLoading">
        <template v-if="detail">
          <el-descriptions :column="2" border title="基本信息">
            <el-descriptions-item label="视频标题" :span="2">{{ detail.title }}</el-descriptions-item>
            <el-descriptions-item label="所属分类">
              <el-tag :type="categoryTagType(detail.category)" effect="light" size="small">
                {{ detail.category }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="时长">{{ formatDuration(detail.duration) }}</el-descriptions-item>
            <el-descriptions-item label="分辨率">{{ detail.resolution }}</el-descriptions-item>
            <el-descriptions-item label="拍摄时间">{{ detail.shootTime }}</el-descriptions-item>
            <el-descriptions-item label="拍摄地点" :span="2">{{ detail.location }}</el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <el-tag
                v-for="t in detail.tags"
                :key="t"
                size="small"
                effect="plain"
                style="margin-right: 4px"
              >
                {{ t }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="入库时间" :span="2">{{ detail.createTime }}</el-descriptions-item>
          </el-descriptions>

          <!-- 维护记录 -->
          <el-tabs v-model="activeTab" style="margin-top: 20px">
            <el-tab-pane :label="`转码记录 (${detail.transcodingRecords.length})`" name="transcode">
              <el-table :data="detail.transcodingRecords" border size="small">
                <el-table-column prop="time" label="时间" width="140" />
                <el-table-column label="格式转换" min-width="150">
                  <template #default="{ row }">{{ row.sourceFormat }} → {{ row.targetFormat }}</template>
                </el-table-column>
                <el-table-column prop="operator" label="操作人" width="80" align="center" />
                <el-table-column prop="status" label="结果" width="70" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
              </el-table>
            </el-tab-pane>
            <el-tab-pane :label="`审核记录 (${detail.reviewRecords.length})`" name="review">
              <el-table :data="detail.reviewRecords" border size="small">
                <el-table-column prop="time" label="时间" width="140" />
                <el-table-column prop="action" label="审核类型" width="90" align="center" />
                <el-table-column prop="reviewer" label="审核人" width="80" align="center" />
                <el-table-column prop="result" label="结果" width="70" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.result === '通过' ? 'success' : 'danger'" size="small">
                      {{ row.result }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="comment" label="审核意见" min-width="150" show-overflow-tooltip />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getVideoPage, getVideoById } from '@/api/video'
import { formatDuration } from '@/utils/format'
import { CATEGORIES } from '@/constants'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10, keyword: '', category: '' })

async function loadData() {
  loading.value = true
  try {
    const data = await getVideoPage({ ...query })
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
  query.category = ''
  handleSearch()
}

// 分类标签配色
function categoryTagType(category) {
  const map = { 海岸风光: 'primary', 海洋生物: 'success', 滨海人文: 'warning', 科研监测: 'info' }
  return map[category] || 'info'
}

// ---------- 详情抽屉 ----------
const drawerVisible = ref(false)
const detailLoading = ref(false)
const detail = ref(null)
const activeTab = ref('transcode')

async function openDetail(row) {
  drawerVisible.value = true
  activeTab.value = 'transcode'
  detailLoading.value = true
  try {
    detail.value = await getVideoById(row.id)
  } finally {
    detailLoading.value = false
  }
}

onMounted(loadData)
</script>
