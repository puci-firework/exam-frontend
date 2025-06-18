// src/api/admin.js
import request from '@/utils/request'

export function getUsers(params) {
  return request({
    url: '/api/admin/users',
    method: 'get',
    params: {
      search: params.search,
      role: params.role,
      page: params.page,
      limit: params.limit
    }
  })
}

export function createUser(data) {
  return request({
    url: '/api/admin/users',
    method: 'post',
    data
  })
}

export function updateUser(id, data) {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'delete'
  })
}
