// Mock 处理器通用工具

// 成功响应
export function ok(data = null, message = '操作成功') {
  return { code: 200, message, data }
}

// 失败响应
export function fail(message = '操作失败', code = 400) {
  return { code, message, data: null }
}

// 从 URL 中解析查询参数
export function getQuery(url) {
  const params = {}
  const idx = url.indexOf('?')
  if (idx === -1) return params
  for (const [k, v] of new URLSearchParams(url.slice(idx + 1))) {
    params[k] = v
  }
  return params
}

// 内存分页
export function paginate(list, page = 1, pageSize = 10) {
  const p = Math.max(1, Number(page) || 1)
  const size = Math.max(1, Number(pageSize) || 10)
  return {
    list: list.slice((p - 1) * size, p * size),
    total: list.length
  }
}
