import request from './request'

// 分页查询视频资源（keyword：标题/拍摄地点/标签；category：分类）
export function getVideoPage(params) {
  return request.get('/api/videos', { params })
}

// 全量精简列表（创建工单时下拉选择）
export function getAllVideos() {
  return request.get('/api/videos/all')
}

// 视频详情（基本信息 + 转码记录 + 审核记录）
export function getVideoById(id) {
  return request.get(`/api/videos/${id}`)
}
