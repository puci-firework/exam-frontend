// src/api/errorBook.js
import request from '@/utils/request'

export function getErrorBook(userId) {
  return request({
    url: '/api/error-book',
    method: 'get',
    params: { userId }
  })
}

export function getErrorBookBySubject(userId, subject) {
  return request({
    url: `/api/error-book/subject/${subject}`,
    method: 'get',
    params: { userId }
  })
}

export function removeFromErrorBook(questionId, userId) {
  return request({
    url: `/api/error-book/${questionId}`,
    method: 'delete',
    params: { userId }
  })
}

export function addErrorNote(questionId, userId, note) {
  return request({
    url: `/api/error-book/${questionId}/note`,
    method: 'post',
    params: { userId },
    data: note
  })
}

export function generatePracticePaper(userId, count = 10) {
  return request({
    url: '/api/error-book/practice',
    method: 'get',
    params: { userId, count }
  })
}

// 获取错题数量
export function getErrorBookCount(userId) {
  return request({
    url: '/api/error-book/count',
    method: 'get',
    params: { userId }
  })
}
