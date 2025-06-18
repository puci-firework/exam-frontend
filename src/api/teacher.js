import request from '@/utils/request'

/**
 * 创建考试
 * @param {Object} data - 考试创建请求数据
 * @returns {Promise<ExamDTO>}
 */
export function createExam(data) {
  return request({
    url: '/api/teacher/exams',
    method: 'post',
    data
  })
}

/**
 * 创建作业
 * @param {Object} data - 作业创建请求数据
 * @returns {Promise<HomeworkDTO>}
 */
export function createHomework(data) {
  return request({
    url: '/api/teacher/homeworks',
    method: 'post',
    data
  })
}

/**
 * 获取考试结果
 * @param {number} examId - 考试ID
 * @returns {Promise<ExamResults>}
 */
export function getExamResults(examId) {
  return request({
    url: `/api/teacher/exams/${examId}/results`,
    method: 'get'
  })
}

/**
 * 获取作业结果
 * @param {number} homeworkId - 作业ID
 * @returns {Promise<HomeworkResults>}
 */
export function getHomeworkResults(homeworkId) {
  return request({
    url: `/api/teacher/homeworks/${homeworkId}/results`,
    method: 'get'
  })
}

/**
 * 导出考试结果为Excel
 * @param {number} examId - 考试ID
 * @returns {Promise<Blob>}
 */
export function exportExamResults(examId) {
  return request({
    url: `/api/teacher/exams/${examId}/export`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 导出作业结果为Excel
 * @param {number} homeworkId - 作业ID
 * @returns {Promise<Blob>}
 */
export function exportHomeworkResults(homeworkId) {
  return request({
    url: `/api/teacher/homeworks/${homeworkId}/export`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 批改作业
 * @param {number} homeworkId - 作业ID
 * @param {number} studentId - 学生ID
 * @param {Array} gradings - 批改数据
 * @returns {Promise<void>}
 */
export function gradeHomework(homeworkId, studentId, gradings) {
  return request({
    url: `/api/teacher/homeworks/${homeworkId}/grade`,
    method: 'post',
    params: { studentId },
    data: gradings
  })
}

/**
 * 发布考试成绩
 * @param {number} examId - 考试ID
 * @returns {Promise<void>}
 */
export function publishExamResults(examId) {
  return request({
    url: `/api/teacher/exams/${examId}/publish`,
    method: 'post'
  })
}

/**
 * 删除考试
 * @param {number} examId - 考试ID
 * @returns {Promise<void>}
 */
export function deleteExam(examId) {
  return request({
    url: `/api/teacher/exams/${examId}`,
    method: 'delete'
  })
}

/**
 * 删除作业
 * @param {number} homeworkId - 作业ID
 * @returns {Promise<void>}
 */
export function deleteHomework(homeworkId) {
  return request({
    url: `/api/teacher/homeworks/${homeworkId}`,
    method: 'delete'
  })
}
