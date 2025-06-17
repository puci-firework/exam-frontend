import request from '@/utils/request'

export function getExamList(userId) {
  return request({
    url: '/api/exams',
    method: 'get',
    params: { userId }
  })
}
