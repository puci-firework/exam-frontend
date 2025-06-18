import request from '@/utils/request'

/**
 * 获取考试列表
 * @param {number} userId - 用户ID
 * @returns {Promise<ExamDTO[]>}
 */
export function getExamList(userId) {
  return request({
    url: '/api/exams',
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取考试详情
 * @param {number} examId - 考试ID
 * @returns {Promise<ExamDetail>}
 */
export function getExamDetail(examId) {
  return request({
    url: `/api/exams/${examId}`,
    method: 'get'
  })
}

/**
 * 开始考试
 * @param {number} examId - 考试ID
 * @param {string | (string | null)[]} studentId - 学生ID
 * @returns {Promise<ExamPaper>}
 */
export function startExam(examId, studentId) {
  return request({
    url: `/api/exams/${examId}/start`,
    method: 'get',
    params: { studentId }
  })
}

/**
 * 提交考试
 * @param {number} examId - 考试ID
 * @param {number} studentId - 学生ID
 * @param {Answer[]} answers - 答案列表
 * @returns {Promise<void>}
 */
export function submitExam(examId, studentId, answers) {
  return request({
    url: `/api/exams/${examId}/submit`,
    method: 'post',
    params: { studentId },
    data: answers
  })
}

/**
 * 获取考试剩余时间
 * @param {number} examId - 考试ID
 * @param {number} studentId - 学生ID
 * @returns {Promise<number>} - 剩余秒数
 */
export function getExamTimeRemaining(examId, studentId) {
  return request({
    url: `/api/exams/${examId}/time-remaining`,
    method: 'get',
    params: { studentId }
  })
}
