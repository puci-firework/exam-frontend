import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/api/auth/info',
    method: 'get',
    params: { token }
  })
}

export function logout(userId) {
  return request({
    url: '/api/auth/logout',
    method: 'post',
    params: { userId }
  })
}
