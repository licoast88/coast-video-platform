import request from './request'

// 分页查询工单（status / keyword 过滤）
export function getOrderPage(params) {
  return request.get('/api/orders', { params })
}

// 创建工单
export function createOrder(data) {
  return request.post('/api/orders', data)
}

// 工单状态流转：待处理 → 处理中 → 已完成
export function advanceOrderStatus(id) {
  return request.put(`/api/orders/${id}/status`)
}
