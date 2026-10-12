// 视频资源接口 Mock
// GET /api/videos        分页列表（keyword 匹配标题/拍摄地点/标签，category 精确匹配）
// GET /api/videos/all    全量精简列表（创建工单时下拉选择用）
// GET /api/videos/:id    视频详情（含转码记录、审核记录）
import Mock from 'mockjs'
import { ok, fail, getQuery, paginate } from './utils'
import { videos } from './data'

export default function videoMock() {
  // 注意：/all 必须先于 /:id 注册，避免被详情规则拦截
  Mock.mock(/\/api\/videos\/all$/, 'get', () => {
    return ok(videos.map((v) => ({ id: v.id, title: v.title, category: v.category })))
  })

  Mock.mock(/\/api\/videos\/\d+$/, 'get', (options) => {
    const id = Number(options.url.match(/\/api\/videos\/(\d+)/)[1])
    const video = videos.find((v) => v.id === id)
    return video ? ok(video) : fail('视频资源不存在', 404)
  })

  Mock.mock(/\/api\/videos(\?.*)?$/, 'get', (options) => {
    const { page = 1, pageSize = 10, keyword = '', category = '' } = getQuery(options.url)
    let list = videos
    if (category) {
      list = list.filter((v) => v.category === category)
    }
    const kw = String(keyword).trim().toLowerCase()
    if (kw) {
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(kw) ||
          v.location.toLowerCase().includes(kw) ||
          v.tags.some((t) => t.toLowerCase().includes(kw))
      )
    }
    return ok(paginate(list, page, pageSize))
  })
}
