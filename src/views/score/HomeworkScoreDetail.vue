<template>
  <div class="score-detail-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>作业详情 - {{ scoreDetail.homework.title }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="$router.push('/score/list')">
          返回
        </el-button>
      </div>

      <div class="score-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">{{ scoreDetail.score.student.name }}</el-descriptions-item>
          <el-descriptions-item label="得分">
            <el-tag :type="getScoreTagType(scoreDetail.score)">
              {{ scoreDetail.score.score }} / {{ scoreDetail.score.totalScore }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDateTime(scoreDetail.score.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider></el-divider>

      <div class="answer-list">
        <h3>作业内容</h3>
        <div class="homework-content" v-html="scoreDetail.homework.content"></div>

        <h3 style="margin-top: 20px;">学生提交</h3>
        <div class="student-submission" v-if="scoreDetail.answers.length > 0" v-html="scoreDetail.answers[0].studentAnswer"></div>
        <div class="student-submission" v-else>暂无提交内容</div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getHomeworkScoreDetail } from '@/api/score'
import { formatDateTime } from '@/utils/date'

export default {
  name: 'HomeworkScoreDetail',
  data() {
    return {
      scoreDetail: {
        homework: {},
        score: {
          student: {}
        },
        answers: []
      },
      loading: false
    }
  },
  computed: {
    userId() {
      return this.$store.state.user.userId
    },
    homeworkId() {
      return this.$route.params.id
    }
  },
  created() {
    this.fetchScoreDetail()
  },
  methods: {
    async fetchScoreDetail() {
      try {
        this.loading = true
        const { data } = await getHomeworkScoreDetail(this.homeworkId, this.userId)
        this.scoreDetail = data
      } catch (error) {
        console.error('获取作业详情失败:', error)
        this.$message.error('获取作业详情失败')
      } finally {
        this.loading = false
      }
    },

    formatDateTime,

    getScoreTagType(score) {
      const percentage = (score.score / score.totalScore) * 100
      if (percentage >= 85) return 'success'
      if (percentage >= 60) return 'warning'
      return 'danger'
    }
  }
}
</script>

<style scoped>
.score-detail-container {
  padding: 20px;
}

.score-info {
  margin-bottom: 20px;
}

.answer-list {
  margin-top: 20px;
}

.homework-content,
.student-submission {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 15px;
}
</style>
