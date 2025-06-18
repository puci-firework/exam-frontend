<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col v-for="(card, index) in statCards" :key="index" :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-title">{{ card.title }}</div>
          </div>
          <div class="stat-icon" :style="{ backgroundColor: card.color }">
            <i :class="card.icon" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作按钮区 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card shadow="hover" class="quick-actions">
          <el-button-group>
            <el-button type="primary" icon="el-icon-date" @click="goToExamList">
              查看所有考试
            </el-button>
            <el-button type="success" icon="el-icon-notebook-2" @click="goToHomeworkList">
              查看所有作业
            </el-button>
            <el-button
              type="info"
              icon="el-icon-data-line"
              @click="goToScoreList"
            >
              查看成绩
            </el-button>
            <el-button
              v-if="!isTeacher"
              type="warning"
              icon="el-icon-collection"
              @click="goToErrorBook"
            >
              错题本
            </el-button>
            <!-- 教师专属 -->
            <template v-if="isTeacher">
              <el-button
                type="warning"
                icon="el-icon-edit"
                @click="goToCreateExam"
              >
                创建新考试
              </el-button>
              <el-button
                type="info"
                icon="el-icon-edit-outline"
                @click="goToCreateHomework"
              >
                布置新作业
              </el-button>
              <el-button
                type="danger"
                icon="el-icon-check"
                @click="goToPendingReviews"
              >
                待批改作业 ({{ pendingReviewsCount }})
              </el-button>
            </template>
            <!-- 管理员专属 -->
            <el-button
              v-if="isAdmin"
              type="danger"
              icon="el-icon-s-tools"
              @click="goToUserManagement"
            >
              用户管理
            </el-button>
          </el-button-group>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要内容区 -->
    <el-row :gutter="20">
      <!-- 近期考试 -->
      <el-col :span="12">
        <el-card shadow="hover" header="近期考试">
          <el-table
            v-loading="loading.exams"
            :data="homeData.recentExams"
            height="300"
            empty-text="暂无近期考试"
          >
            <el-table-column prop="name" label="考试名称" width="180" />
            <el-table-column label="考试时间">
              <template #default="{row}">
                {{ formatDateTime(row.startTime) }} ~
                {{ formatDateTime(row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{row}">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{row}">
                <el-button-group>
                  <el-button size="mini" @click.stop="handleViewExam(row.id)">详情</el-button>
                  <el-button
                    size="mini"
                    type="primary"
                    :disabled="row.status !== 2"
                    @click.stop="handleStartExam(row.id)"
                  >
                    {{ isTeacher ? '批改' : '开始' }}
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 待完成作业 -->
      <el-col :span="12">
        <el-card shadow="hover" header="待完成作业">
          <el-table
            v-loading="loading.homeworks"
            :data="homeData.recentHomeworks"
            height="300"
            empty-text="暂无待完成作业"
          >
            <el-table-column prop="title" label="作业名称" width="180" />
            <el-table-column label="截止时间">
              <template #default="{row}">
                {{ formatDateTime(row.deadline) }}
                <el-tag
                  v-if="isUrgent(row.deadline)"
                  type="danger"
                  size="mini"
                >
                  即将截止
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{row}">
                <el-button-group>
                  <el-button size="mini" @click.stop="handleViewHomework(row.id)">详情</el-button>
                  <el-button
                    size="mini"
                    type="primary"
                    :disabled="isTeacher"
                    @click.stop="handleDoHomework(row.id)"
                  >
                    完成作业
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新成绩 -->
    <el-card shadow="hover" class="mt-4" header="最新成绩">
      <div class="score-header">
        <el-tabs v-model="activeScoreTab" @tab-click="handleScoreTabChange">
          <el-tab-pane label="考试成绩" name="exams" />
          <el-tab-pane label="作业成绩" name="homeworks" />
        </el-tabs>
        <el-button
          type="text"
          icon="el-icon-refresh"
          style="margin-left: auto;"
          @click="loadScoreData"
        />
      </div>

      <el-table
        v-loading="loading.scores"
        :data="scoreData"
        empty-text="暂无成绩记录"
      >
        <el-table-column
          :prop="activeScoreTab === 'exams' ? 'examName' : 'homeworkName'"
          :label="activeScoreTab === 'exams' ? '考试名称' : '作业名称'"
          width="200"
        />
        <el-table-column label="分数/总分" width="150">
          <template #default="{row}">
            {{ row.score }} / {{ row.totalScore }}
            <el-progress
              :percentage="row.percentage"
              :color="getScoreColor(row.percentage)"
              :show-text="false"
              :stroke-width="6"
              class="score-progress"
            />
          </template>
        </el-table-column>
        <el-table-column label="百分比" width="120">
          <template #default="{row}">
            <el-tag :type="getScoreTagType(row.percentage)">
              {{ row.percentage }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{row}">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status === 'PASSED' ? '及格' : '不及格' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="180">
          <template #default="{row}">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{row}">
            <el-button
              size="mini"
              @click="handleViewScoreDetail(row.id, activeScoreTab)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getHomeData as fetchHomeData } from '@/api/home'
import { getExamScores, getHomeworkScores } from '@/api/score'
import { formatDate, formatDateTime } from '@/utils/date'
import { getErrorBookCount } from '@/api/errorBook' // 新增API导入

export default {
  name: 'Dashboard',
  data() {
    return {
      homeData: {
        recentExams: [],
        recentHomeworks: [],
        latestScores: []
      },
      scoreData: [],
      activeScoreTab: 'exams',
      loading: {
        exams: true,
        homeworks: true,
        scores: true
      },
      statCards: [
        { title: '待考科目', value: 0, icon: 'el-icon-date', color: '#409EFF' },
        { title: '待交作业', value: 0, icon: 'el-icon-document', color: '#67C23A' },
        {
          title: this.isAdmin ? '总用户数' : '错题数量',
          value: 0,
          icon: this.isAdmin ? 'el-icon-user' : 'el-icon-collection',
          color: '#F56C6C'
        },
        { title: '平均成绩', value: '--', icon: 'el-icon-data-analysis', color: '#E6A23C' }
      ]
    }
  },
  // computed部分保持不变
  computed: {
    userId() {
      return this.$store.state.user.userId || 1 // 默认测试用户ID
    },
    isTeacher() {
      return this.$store.state.user.role === 'TEACHER'
    },
    isAdmin() {
      return this.$store.state.user.role === 'ADMIN'
    }
  },
  created() {
    this.loadHomeData()
    this.loadScoreData()
    this.loadErrorBookCount() // 新增：加载错题数量
  },
  methods: {
    // 新增：加载错题数量
    async loadErrorBookCount() {
      if (this.isTeacher) return // 老师不需要错题本

      try {
        const { data } = await getErrorBookCount(this.userId)
        this.statCards[2].value = data.count
      } catch (error) {
        console.error('获取错题数量失败:', error)
      }
    },

    // 新增：跳转到错题本
    goToErrorBook() {
      this.$router.push('/error-book/list')
    },
    // 加载首页数据
    async loadHomeData() {
      try {
        this.showLoading()
        const { data } = await fetchHomeData(this.userId)

        // 数据转换适配
        this.homeData = this.transformData(data)

        // 更新统计卡片
        this.updateStatCards()
      } catch (error) {
        console.error('加载首页数据失败:', error)
        this.$message.error('数据加载失败: ' + (error.message || '未知错误'))
      } finally {
        this.hideLoading()
      }
    },

    // 加载成绩数据
    async loadScoreData() {
      try {
        this.loading.scores = true
        let response

        if (this.activeScoreTab === 'exams') {
          response = await getExamScores(this.userId)
          this.scoreData = response.data.map(score => ({
            id: score.exam.id,
            examName: score.exam.title,
            score: score.score,
            totalScore: score.totalScore,
            percentage: Math.round((score.score / score.totalScore) * 100),
            status: score.status,
            date: score.createdAt
          }))
        } else {
          response = await getHomeworkScores(this.userId)
          this.scoreData = response.data.map(score => ({
            id: score.homework.id,
            homeworkName: score.homework.title,
            score: score.score,
            totalScore: score.totalScore,
            percentage: Math.round((score.score / score.totalScore) * 100),
            status: score.status,
            date: score.createdAt
          }))
        }

        // 更新平均成绩统计
        if (this.scoreData.length > 0) {
          const avg = this.scoreData.reduce((sum, item) => sum + item.percentage, 0) /
            this.scoreData.length
          this.statCards[2].value = avg.toFixed(1)
        }
      } catch (error) {
        console.error('加载成绩数据失败:', error)
        this.$message.error('成绩数据加载失败')
      } finally {
        this.loading.scores = false
      }
    },

    // 数据转换方法
    transformData(apiData) {
      return {
        recentExams: apiData.recentExams?.map(exam => ({
          id: exam.id,
          name: exam.title,
          startTime: exam.startTime,
          endTime: exam.endTime,
          status: this.calcExamStatus(exam)
        })) || [],

        recentHomeworks: apiData.recentHomeworks?.map(hw => ({
          id: hw.id,
          title: hw.title,
          deadline: hw.deadline,
          subject: hw.subject
        })) || []
      }
    },

    // 计算考试状态
    calcExamStatus(exam) {
      const now = new Date()
      const start = new Date(exam.startTime)
      const end = new Date(exam.endTime)

      if (!exam.published) return 0 // 未发布
      if (now < start) return 1 // 未开始
      if (now > end) return 3 // 已结束
      return 2 // 进行中
    },

    // 更新统计卡片
    updateStatCards() {
      this.statCards[0].value = this.homeData.recentExams.length
      this.statCards[1].value = this.homeData.recentHomeworks.length
    },

    // 状态显示辅助方法
    getStatusText(status) {
      const map = { 0: '未发布', 1: '未开始', 2: '进行中', 3: '已结束' }
      return map[status] || '未知状态'
    },

    getStatusTagType(status) {
      const map = { 0: 'info', 1: '', 2: 'success', 3: 'warning' }
      return map[status] || 'info'
    },

    // 时间处理
    formatDate,
    formatDateTime,

    isUrgent(deadline) {
      const dueDate = new Date(deadline)
      const now = new Date()
      const diffHours = (dueDate - now) / (1000 * 60 * 60)
      return diffHours > 0 && diffHours < 24 // 24小时内截止
    },

    // 分数颜色计算
    getScoreColor(percentage) {
      if (percentage >= 85) return '#67C23A'
      if (percentage >= 60) return '#E6A23C'
      return '#F56C6C'
    },

    getScoreTagType(percentage) {
      if (percentage >= 85) return 'success'
      if (percentage >= 60) return 'warning'
      return 'danger'
    },

    // 加载状态控制
    showLoading() {
      this.loading = { exams: true, homeworks: true, scores: true }
    },

    hideLoading() {
      this.loading = { exams: false, homeworks: false, scores: false }
    },

    // 导航方法
    goToExamList() {
      this.$router.push('/exam/list')
    },

    goToHomeworkList() {
      this.$router.push('/homework/list')
    },

    goToScoreList() {
      this.$router.push('/score/list')
    },

    goToCreateExam() {
      this.$router.push('/exam/create')
    },

    goToCreateHomework() {
      this.$router.push('/homework/create')
    },

    handleViewExam(id) {
      if (!id) {
        this.$message.error('无效的考试ID')
        return
      }
      this.$router.push(`/exam/detail/${id}`).catch(err => {
        console.error('导航失败:', err)
        this.$message.error('无法跳转到考试详情')
      })
    },

    handleViewHomework(id) {
      if (!id) {
        this.$message.error('无效的作业ID')
        return
      }
      this.$router.push(`/homework/detail/${id}`).catch(err => {
        console.error('导航失败:', err)
        this.$message.error('无法跳转到作业详情')
      })
    },

    handleStartExam(id) {
      if (this.isTeacher) {
        this.$router.push(`/exam/review/${id}`)
      } else {
        this.$router.push(`/exam/do/${id}`)
      }
    },

    handleDoHomework(id) {
      this.$router.push(`/homework/do/${id}`)
    },

    handleViewScoreDetail(id, type) {
      if (type === 'exams') {
        this.$router.push(`/score/exam/${id}`)
      } else {
        this.$router.push(`/score/homework/${id}`)
      }
    },

    handleScoreTabChange() {
      this.loadScoreData()
    },

    goToUserManagement() {
      this.$router.push('/admin/users')
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  .stat-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 5px;
        line-height: 1;
      }

      .stat-title {
        color: #999;
        font-size: 14px;
      }
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      flex-shrink: 0;
    }
  }

  .mb-4 {
    margin-bottom: 20px;
  }

  .mt-4 {
    margin-top: 20px;
  }

  .score-progress {
    margin-top: 6px;
    width: 80%;
  }

  .quick-actions {
    margin-bottom: 20px;

    .el-button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .score-header {
    display: flex;
    align-items: center;
    padding: 0 20px;
    margin-bottom: 10px;
  }

  .el-button-group .el-button {
    margin-right: 8px;
  }

  @media (max-width: 768px) {
    .quick-actions .el-button {
      margin-bottom: 10px;
      width: 100%;
    }
  }
}
</style>
