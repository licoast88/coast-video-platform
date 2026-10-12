// Mock 入口：注册全部接口拦截规则
// 对接真实后端时，移除 main.js 中的 setupMock() 调用即可，业务代码无需改动
import Mock from 'mockjs'
import authMock from './auth'
import videoMock from './video'
import orderMock from './order'
import dashboardMock from './dashboard'

export function setupMock() {
  // 模拟 200~500ms 网络延迟
  Mock.setup({ timeout: '200-500' })
  authMock()
  videoMock()
  orderMock()
  dashboardMock()
}
