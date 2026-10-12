// 工单接口 Mock
// GET  /api/orders             分页列表（status / keyword 过滤）
// POST /api/orders             创建工单
// PUT  /api/orders/:id/status  状态流转（待处理→处理中→已完成）
import Mock from 'mockjs'
import { ok, fail, getQuery, paginate } from './utils'
import { orders, videos, nextOrderId } from './data'

const FLOW = { 待处理: '处理中', 处理中: '已完成' }

function nowStr() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function orderMock() {
  Mock.mock(/\/api\/orders\/\d+\/status$/, 'put', (options) => {
    const id = Number(options.url.match(/\/api\/orders\/(\d+)\/status/)[1])
    const order = orders.find((o) => o.id === id)
    if (!order) return fail('工单不存在', 404)
    const next = FLOW[order.status]
    if (!next) return fail(`工单已${order.status}，不能再流转`)
    order.status = next
    order.handler = order.handler || '运维-刘工'
    order.updateTime = nowStr()
    return ok(order, `工单已流转为「${next}」`)
  })

  Mock.mock(/\/api\/orders$/, 'post', (options) => {
    const { videoId, problemType, description, priority } = JSON.parse(options.body || '{}')
    if (!videoId || !problemType || !description || !priority) {
      return fail('请完整填写工单信息')
    }
    const video = videos.find((v) => v.id === Number(videoId))
    if (!video) return fail('所选视频资源不存在', 404)
    const id = nextOrderId()
    const order = {
      id,
      orderNo: `WO202610${String(1000 + id)}`,
      videoId: video.id,
      videoTitle: video.title,
      problemType,
      description,
      priority,
      status: '待处理',
      creator: '系统管理员',
      handler: '',
      createTime: nowStr(),
      updateTime: nowStr()
    }
    orders.unshift(order)
    return ok(order, '工单创建成功')
  })

  Mock.mock(/\/api\/orders(\?.*)?$/, 'get', (options) => {
    const { page = 1, pageSize = 10, status = '', keyword = '' } = getQuery(options.url)
    let list = [...orders].sort((a, b) => b.id - a.id)
    if (status) list = list.filter((o) => o.status === status)
    const kw = String(keyword).trim().toLowerCase()
    if (kw) {
      list = list.filter(
        (o) => o.orderNo.toLowerCase().includes(kw) || o.videoTitle.toLowerCase().includes(kw)
      )
    }
    return ok(paginate(list, page, pageSize))
  })
}
