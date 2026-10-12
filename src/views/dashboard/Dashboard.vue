<template>
  <div v-loading="loading" class="page-card">
    <!-- 核心 KPI -->
    <el-row :gutter="16">
      <el-col :span="8">
        <div class="kpi-card kpi-blue">
          <div class="kpi-icon"><el-icon :size="28"><VideoCamera /></el-icon></div>
          <div>
            <div class="kpi-value">{{ stats.videoTotal }}</div>
            <div class="kpi-label">视频资源总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="kpi-card kpi-orange">
          <div class="kpi-icon"><el-icon :size="28"><BellFilled /></el-icon></div>
          <div>
            <div class="kpi-value">{{ stats.pendingOrders }}</div>
            <div class="kpi-label">待处理工单数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="kpi-card kpi-green">
          <div class="kpi-icon"><el-icon :size="28"><CircleCheckFilled /></el-icon></div>
          <div>
            <div class="kpi-value">{{ stats.finishedOrders }}</div>
            <div class="kpi-label">已完成工单数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 统计图表 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-title">视频分类分布</div>
          <div ref="pieRef" class="chart-box" />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-title">工单状态概览</div>
          <div ref="barRef" class="chart-box" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import { getStats, getCategoryDist } from '@/api/dashboard'

const loading = ref(false)
const stats = reactive({ videoTotal: 0, pendingOrders: 0, processingOrders: 0, finishedOrders: 0 })

const pieRef = ref(null)
const barRef = ref(null)
let pieChart = null
let barChart = null

async function loadData() {
  loading.value = true
  try {
    const [s, dist] = await Promise.all([getStats(), getCategoryDist()])
    Object.assign(stats, s)
    renderPie(dist)
    renderBar()
  } finally {
    loading.value = false
  }
}

function renderPie(dist) {
  if (!pieChart) pieChart = echarts.init(pieRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 个 ({d}%)' },
    legend: { bottom: 0 },
    series: [
      {
        name: '视频分类',
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { formatter: '{b}\n{c} 个' },
        data: dist
      }
    ]
  })
}

function renderBar() {
  if (!barChart) barChart = echarts.init(barRef.value)
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 30, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: ['待处理', '处理中', '已完成'] },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        type: 'bar',
        barWidth: 48,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: (p) => ['#e6a23c', '#409eff', '#67c23a'][p.dataIndex]
        },
        data: [stats.pendingOrders, stats.processingOrders, stats.finishedOrders]
      }
    ]
  })
}

function handleResize() {
  pieChart?.resize()
  barChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  barChart?.dispose()
})
</script>

<style scoped>
.kpi-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
  border-radius: 8px;
  color: #fff;
}

.kpi-blue { background: linear-gradient(135deg, #409eff, #2b6cb0); }
.kpi-orange { background: linear-gradient(135deg, #e6a23c, #dd7e1f); }
.kpi-green { background: linear-gradient(135deg, #67c23a, #3d8b37); }

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
}

.kpi-value { font-size: 30px; font-weight: 700; line-height: 1.2; }
.kpi-label { font-size: 14px; opacity: 0.9; }

.chart-card {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.chart-box { height: 340px; }
</style>
