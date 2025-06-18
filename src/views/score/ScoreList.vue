<template>
  <div class="score-list-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>成绩管理</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="fetchScores">
          刷新
        </el-button>
      </div>

      <el-tabs v-model="activeTab">
        <!-- 考试成绩 -->
        <el-tab-pane label="考试成绩" name="exams">
          <el-table
            :data="examScores"
            v-loading="loading.exams"
            empty-text="暂无成绩数据">
            <el-table-column prop="exam.title" label="考试名称" width="200" />
            <el-table-column label="分数" width="120">
              <template #default="{row}">
                {{ row.score }} / {{ row.totalScore }}
                <el-progress
                  :percentage="Math.round((row.score / row.totalScore) * 100)"
                  :color="getScoreColor(row.score, row.totalScore)"
                  :show-text="false"
                  :stroke-width="6" />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{row}">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ row.status === 'PASSED' ? '及格' : '不及格' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{row}">
                <el-button
                  size="mini"
                  @click="handleViewExamDetail(row.exam.id)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 作业成绩 -->
        <el-tab-pane label="作业成绩" name="homeworks">
          <el-table
            :data="homeworkScores"
            v-loading="loading.homeworks"
            empty-text="暂无成绩数据">
            <el-table-column prop="homework.title" label="作业名称" width="200" />
            <el-table-column label="分数" width="120">
              <template #default="{row}">
                {{ row.score }} / {{ row.totalScore }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{row}">
                <el-button
                  size="mini"
                  @click="handleViewHomeworkDetail(row.homework.id)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import {
  getExamScores,
  getHomeworkScores
} from '@/api/score'

export default {
  name: 'ScoreList',
  data() {
    return {
      activeTab: 'exams',
      examScores: [],
      homeworkScores: [],
      loading: {
        exams: false,
        homeworks: false
      }
    }
  },
  computed: {
    userId() {
      return this.$store.state.user.userId
    }
  },
  created() {
    this.fetchScores()
  },
  methods: {
    async fetchScores() {
      try {
        this.loading.exams = true
        this.loading.homeworks = true

        const { data: examData } = await getExamScores(this.userId)
        this.examScores = examData

        const { data: homeworkData } = await getHomeworkScores(this.userId)
        this.homeworkScores = homeworkData
      } catch (error) {
        console.error('获取成绩失败:', error)
        this.$message.error('获取成绩失败')
      } finally {
        this.loading.exams = false
        this.loading.homeworks = false
      }
    },

    getScoreColor(score, totalScore) {
      const percentage = (score / totalScore) * 100
      if (percentage >= 85) return '#67C23A'
      if (percentage >= 60) return '#E6A23C'
      return '#F56C6C'
    },

    getStatusTagType(status) {
      return status === 'PASSED' ? 'success' : 'danger'
    },

    handleViewExamDetail(examId) {
      this.$router.push(`/score/exam/${examId}`)
    },

    handleViewHomeworkDetail(homeworkId) {
      this.$router.push(`/score/homework/${homeworkId}`)
    }
  }
}
</script>

<style scoped>
.score-list-container {
  padding: 20px;
}

.el-progress {
  display: inline-block;
  width: 100px;
  margin-left: 10px;
}
</style>
