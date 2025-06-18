import request from '@/utils/request'

/**
 * 获取作业列表
 * @param {number} userId - 用户ID
 * @returns {Promise<HomeworkDTO[]>}
 */
export function getHomeworkList(userId) {
  return request({
    url: '/api/homeworks',
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取作业详情
 * @param {number} homeworkId - 作业ID
 * @returns {Promise<HomeworkDetail>}
 */
export function getHomeworkDetail(homeworkId) {
  return request({
    url: `/api/homeworks/${homeworkId}`,
    method: 'get'
  })
}

/**
 * 开始作业
 * @param {number} homeworkId - 作业ID
 * @param {number} studentId - 学生ID
 * @returns {Promise<HomeworkPaper>}
 */
export function startHomework(homeworkId, studentId) {
  return request({
    url: `/api/homeworks/${homeworkId}/start`,
    method: 'get',
    params: { studentId }
  })
}

/**
 * 提交作业
 * @param {number} homeworkId - 作业ID
 * @param {number} studentId - 学生ID
 * @param {Answer[]} answers - 答案列表
 * @returns {Promise<void>}
 */
export function submitHomework(homeworkId, studentId, answers) {
  return request({
    url: `/api/homeworks/${homeworkId}/submit`,
    method: 'post',
    params: { studentId },
    data: answers
  })
}

/**
 * 保存作业草稿
 * @param {number} homeworkId - 作业ID
 * @param {number} studentId - 学生ID
 * @param {Answer[]} answers - 答案列表
 * @returns {Promise<void>}
 */
export function saveHomeworkDraft(homeworkId, studentId, answers) {
  return request({
    url: `/api/homeworks/${homeworkId}/draft`,
    method: 'post',
    params: { studentId },
    data: answers
  })
}
