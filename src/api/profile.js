import request from '@/utils/request'
import store from '@/store' // 引入store以获取当前用户ID

export function getProfile() {
  const userId = store.getters.userId
  return request({
    url: '/api/profile',
    method: 'get',
    params: { userId }
  })
}

export function updateProfile(data) {
  return request({
    url: '/api/profile',
    method: 'put',
    data
  })
}

export function changePassword(data) {
  return request({
    url: '/api/profile/password',
    method: 'put',
    data
  })
}

export function getLearningStatistics() {
  // 从Vuex获取当前用户ID
  const userId = store.getters.userId
  return request({
    url: '/api/profile/statistics',
    method: 'get',
    params: { userId }
  })
}

export function uploadAvatar(file) {
  const userId = store.getters.userId; // 获取当前用户ID
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId); // 添加userId参数

  return request({
    url: '/api/profile/avatar',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}
