import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/api/exams',
    method: 'get',
    params
  })
}
