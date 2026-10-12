import { defineStore } from 'pinia'
import { loginApi } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('cvp_token') || '',
    userInfo: JSON.parse(localStorage.getItem('cvp_user') || 'null')
  }),
  getters: {
    isLogin: (state) => !!state.token
  },
  actions: {
    async login(form) {
      const data = await loginApi(form)
      this.token = data.token
      this.userInfo = data.user
      localStorage.setItem('cvp_token', data.token)
      localStorage.setItem('cvp_user', JSON.stringify(data.user))
    },
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('cvp_token')
      localStorage.removeItem('cvp_user')
    }
  }
})
