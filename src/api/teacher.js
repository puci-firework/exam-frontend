import request from '@/utils/request'

export function createExam(data) {
  return request({
    url: '/api/teacher/exams',
    method: 'post',
    data
  })
}

export function getExamResults(examId) {
  return request({
    url: `/api/teacher/exams/${examId}/results`,
    method: 'get'
  })
}

export function exportExamResults(examId) {
  return request({
    url: `/api/teacher/exams/${examId}/export`,
    method: 'get',
    responseType: 'blob'
  })
}

export function publishExamResults(examId) {
  return request({
    url: `/api/teacher/exams/${examId}/publish`,
    method: 'post'
  })
}

export function deleteExam(examId) {
  return request({
    url: `/api/teacher/exams/${examId}`,
    method: 'delete'
  })
}

export function createHomework(data) {
  return request({
    url: '/api/teacher/homeworks',
    method: 'post',
    data
  })
}

export function getHomeworkResults(homeworkId) {
  return request({
    url: `/api/teacher/homeworks/${homeworkId}/results`,
    method: 'get'
  })
}

export function exportHomeworkResults(homeworkId) {
  return request({
    url: `/api/teacher/homeworks/${homeworkId}/export`,
    method: 'get',
    responseType: 'blob'
  })
}

export function deleteHomework(homeworkId) {
  return request({
    url: `/api/teacher/homeworks/${homeworkId}`,
    method: 'delete'
  })
}
