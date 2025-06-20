import request from '@/utils/request'
import store from '@/store'

export function login(data) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  const token = store.getters.token
  return request({
    url: '/api/auth/info',
    method: 'get',
    params: { token }
  })
}

export function logout(token) {
  return request({
    url: '/api/auth/logout',
    method: 'post',
    params: { token }
  })
}
