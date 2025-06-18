import request from '@/utils/request'

// 获取首页数据
export function getHomeData(userId) {
  return request({
    url: '/api/home',
    method: 'get',
    params: { userId }
  })
}

// 获取用户通知
export function getNotifications(userId) {
  return request({
    url: '/api/home/notifications',
    method: 'get',
    params: { userId }
  })
}

// 标记通知为已读
export function markNotificationAsRead(notificationId) {
  return request({
    url: `/api/home/notifications/${notificationId}/read`,
    method: 'put'
  })
}
