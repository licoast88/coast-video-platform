import request from './request'

// 核心 KPI：视频资源总数、待处理工单数等
export function getStats() {
  return request.get('/api/dashboard/stats')
}

// 视频分类分布（环形图）
export function getCategoryDist() {
  return request.get('/api/dashboard/category-dist')
}
