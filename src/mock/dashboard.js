// 数据看板接口 Mock
// GET /api/dashboard/stats          核心 KPI：视频资源总数、待处理工单数
// GET /api/dashboard/category-dist  视频分类分布（环形图）
import Mock from 'mockjs'
import { ok } from './utils'
import { videos, orders } from './data'
import { CATEGORIES } from '@/constants'

export default function dashboardMock() {
  Mock.mock(/\/api\/dashboard\/stats$/, 'get', () => {
    return ok({
      videoTotal: videos.length,
      pendingOrders: orders.filter((o) => o.status === '待处理').length,
      processingOrders: orders.filter((o) => o.status === '处理中').length,
      finishedOrders: orders.filter((o) => o.status === '已完成').length
    })
  })

  Mock.mock(/\/api\/dashboard\/category-dist$/, 'get', () => {
    return ok(
      CATEGORIES.map((name) => ({
        name,
        value: videos.filter((v) => v.category === name).length
      }))
    )
  })
}
