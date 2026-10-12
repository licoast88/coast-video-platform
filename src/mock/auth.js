// 用户认证接口 Mock：POST /api/auth/login
import Mock from 'mockjs'
import { ok, fail } from './utils'

export default function authMock() {
  Mock.mock(/\/api\/auth\/login$/, 'post', (options) => {
    const { username, password } = JSON.parse(options.body || '{}')
    if (username === 'admin' && password === '123456') {
      return ok(
        {
          token: `mock-token-${Date.now()}`,
          user: { username: 'admin', name: '系统管理员', role: 'admin' }
        },
        '登录成功'
      )
    }
    return fail('用户名或密码错误（演示账号 admin / 123456）', 401)
  })
}
