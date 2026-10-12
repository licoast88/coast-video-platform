// Mock 基础数据：视频资源（含维护记录）与工单
import {
  CATEGORIES,
  LOCATIONS,
  TAGS,
  RESOLUTIONS,
  PROBLEM_TYPES,
  PRIORITIES
} from '@/constants'

function pick(arr, i) {
  return arr[i % arr.length]
}

// 随机选取 n 个不重复标签
function pickTags(seed) {
  const a = TAGS[seed % TAGS.length]
  const b = TAGS[(seed * 3 + 5) % TAGS.length]
  return a === b ? [a] : [a, b]
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function dateStr(monthOffset, day, hour = 10, minute = 0) {
  const d = new Date(2026, 8 - monthOffset, day, hour, minute)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ---------- 视频资源 ----------
const VIDEO_TITLE_TPL = {
  海岸风光: ['金沙滩日出延时记录', '银滩风暴潮过境实况', '月亮湾潮汐涨落记录', '礁石区海浪冲击慢镜头'],
  海洋生物: ['珊瑚礁鱼群水下观测', '海鸥岛候鸟栖息记录', '红树林弹涂鱼活动影像', '浅海鱼类产卵期监测'],
  滨海人文: ['青云渔港开渔节纪实', '渔民赶海作业记录', '渔港夜市人文影像', '海岸线民俗活动航拍'],
  科研监测: ['岸线侵蚀无人机巡查', '湿地生态季度监测', '海水水质采样点巡查', '红树林保护区月度巡检']
}

export const videos = []
let vid = 1
CATEGORIES.forEach((category, ci) => {
  VIDEO_TITLE_TPL[category].forEach((title, ti) => {
    // 每个标题模板生成 2~3 条不同地点/时间的视频
    const count = 2 + ((ci + ti) % 2)
    for (let k = 0; k < count; k++) {
      const id = vid++
      const location = pick(LOCATIONS, id * 3 + ci)
      const duration = 60 + ((id * 137) % 1740) // 1分钟 ~ 30分钟
      const shootTime = dateStr((id * 7) % 6, (id * 11) % 27 + 1, 6 + (id * 5) % 14)
      videos.push({
        id,
        title: k === 0 ? title : `${title}（第${k + 1}期）`,
        category,
        location,
        tags: pickTags(id),
        duration,
        resolution: pick(RESOLUTIONS, id),
        shootTime,
        createTime: dateStr(Math.max(0, ((id * 7) % 6) - 1), (id * 11) % 27 + 1, 14),
        // 维护记录：转码记录
        transcodingRecords: [
          {
            id: id * 10 + 1,
            time: dateStr(Math.max(0, ((id * 7) % 6) - 1), (id * 11) % 27 + 1, 15),
            sourceFormat: pick(['mov', 'avi', 'mp4'], id),
            targetFormat: 'mp4 (H.264)',
            operator: pick(['张海涛', '李珊', '王鹏'], id),
            status: '成功',
            remark: '入库自动转码'
          },
          ...(id % 4 === 0
            ? [
                {
                  id: id * 10 + 2,
                  time: dateStr(Math.max(0, ((id * 7) % 6) - 1), ((id * 11) % 27) + 2, 9),
                  sourceFormat: 'mp4 (H.264)',
                  targetFormat: 'mp4 (H.265)',
                  operator: '李珊',
                  status: id % 8 === 0 ? '失败' : '成功',
                  remark: id % 8 === 0 ? '源文件码率异常，已重试' : '高清版本转存'
                }
              ]
            : [])
        ],
        // 维护记录：审核记录
        reviewRecords: [
          {
            id: id * 100 + 1,
            time: dateStr(Math.max(0, ((id * 7) % 6) - 1), ((id * 11) % 27) + 1, 11),
            reviewer: pick(['陈审核', '赵质检'], id),
            action: '入库审核',
            result: '通过',
            comment: '画面与元数据完整，准予入库'
          },
          ...(id % 5 === 0
            ? [
                {
                  id: id * 100 + 2,
                  time: dateStr(Math.max(0, ((id * 7) % 6) - 2), ((id * 11) % 27) + 3, 16),
                  reviewer: '赵质检',
                  action: '定期复检',
                  result: id % 10 === 0 ? '不通过' : '通过',
                  comment: id % 10 === 0 ? '发现片段花屏，已创建工单跟进' : '抽检合格'
                }
              ]
            : [])
        ]
      })
    }
  })
})

// ---------- 工单 ----------
const ORDER_DESC = {
  画面异常: ['视频 03:12 起出现大面积花屏', '画面整体偏色，疑似白平衡异常', '片段中间有 2 秒黑帧'],
  音频缺失: ['全片无声音轨', '前 30 秒有环境音，之后音频丢失', '左右声道不一致'],
  元数据错误: ['拍摄地点标注有误', '拍摄时间与实际不符', '分类标签错误'],
  其他: ['封面图缺失', '视频标题重复，需要合并']
}

export const orders = []
// 状态分布：保证有待处理/处理中/已完成三种
const STATUS_PLAN = [
  '待处理', '待处理', '待处理', '待处理', '待处理',
  '处理中', '处理中', '处理中', '处理中',
  '已完成', '已完成', '已完成', '已完成', '已完成', '已完成'
]
const CREATORS = ['张海涛', '李珊', '王鹏', '陈审核']
const HANDLERS = ['运维-刘工', '运维-何工']

STATUS_PLAN.forEach((status, i) => {
  const idx = i + 1
  const video = videos[(i * 5 + 3) % videos.length]
  const problemType = pick(PROBLEM_TYPES, i)
  const createTime = dateStr(1, (idx * 3) % 27 + 1, 9 + (idx % 8))
  const started = status !== '待处理'
  const done = status === '已完成'
  orders.push({
    id: idx,
    orderNo: `WO2026${pad(10)}${String(1000 + idx)}`,
    videoId: video.id,
    videoTitle: video.title,
    problemType,
    description: pick(ORDER_DESC[problemType], i),
    priority: pick(PRIORITIES, i * 2 + (done ? 1 : 0)),
    status,
    creator: pick(CREATORS, i),
    handler: started ? pick(HANDLERS, i) : '',
    createTime,
    updateTime: done ? dateStr(0, (idx * 3) % 27 + 1, 15) : started ? dateStr(0, (idx * 3) % 27 + 1, 10) : createTime
  })
})

// 工单 id / 单号自增种子（新建工单时使用）
export let orderSeq = orders.length
export function nextOrderId() {
  orderSeq += 1
  return orderSeq
}
