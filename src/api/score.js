import request from '@/utils/request'

/**
 * 获取成绩汇总
 * @param {number} userId - 用户ID
 * @returns {Promise<ScoreSummary>}
 */
export function getScoreSummary(userId) {
  return request({
    url: '/api/scores',
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取考试成绩列表
 * @param {number} userId - 用户ID
 * @returns {Promise<ExamScore[]>}
 */
export function getExamScores(userId) {
  return request({
    url: '/api/scores/exams',
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取作业成绩列表
 * @param {number} userId - 用户ID
 * @returns {Promise<HomeworkScore[]>}
 */
export function getHomeworkScores(userId) {
  return request({
    url: '/api/scores/homeworks',
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取考试详情
 * @param {number} examId - 考试ID
 * @param {number} userId - 用户ID
 * @returns {Promise<ExamScoreDetail>}
 */
export function getExamScoreDetail(examId, userId) {
  return request({
    url: `/api/scores/exams/${examId}`,
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取作业详情
 * @param {number} homeworkId - 作业ID
 * @param {number} userId - 用户ID
 * @returns {Promise<HomeworkScoreDetail>}
 */
export function getHomeworkScoreDetail(homeworkId, userId) {
  return request({
    url: `/api/scores/homeworks/${homeworkId}`,
    method: 'get',
    params: { userId }
  })
}
