<template>
  <div class="score-detail-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>作业详情 - {{ scoreDetail.homework.title }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="$router.push('/score/list')"
        >
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
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(scoreDetail.score.status)">
              {{ scoreDetail.score.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDateTime(scoreDetail.score.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <div class="answer-list">
        <h3>答题详情</h3>
        <div v-for="(answer, index) in scoreDetail.answers" :key="index" class="answer-item">
          <div class="question">
            <span class="question-index">{{ index + 1 }}.</span>
            <span>{{ answer.question.content }}</span>
            <span class="question-score">({{ answer.score }}分)</span>
          </div>
          <div class="student-answer">
            <el-tag size="small">学生答案</el-tag>
            <span>{{ answer.answer || '未作答' }}</span>
          </div>
          <div class="correct-answer">
            <el-tag size="small" type="success">正确答案</el-tag>
            <span>{{ answer.question.answer }}</span>
          </div>
        </div>
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
      return this.$route.query.studentId || this.$store.state.user.userId
    },
    homeworkId() {
      return this.$route.params.id
    }
  },
  watch: {
    // 监听路由变化重新获取数据
    '$route': {
      immediate: true,
      handler() {
        this.fetchScoreDetail()
      }
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
    },

    getStatusTagType(status) {
      switch (status) {
        case 'COMPLETED':
          return 'success' // 绿色 - 已完成
        case 'SUBMITTED':
          return 'primary' // 蓝色 - 已提交
        case 'LATE':
          return 'warning' // 黄色 - 迟交
        default:
          return 'danger' // 红色 - 其他状态
      }
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

.answer-item {
  margin: 15px 0;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.question {
  font-weight: bold;
  margin-bottom: 10px;
}

.question-index {
  margin-right: 8px;
}

.question-score {
  margin-left: 10px;
  color: #E6A23C;
}

.student-answer,
.correct-answer,
.teacher-comment {
  margin: 8px 0;
  padding-left: 20px;
}

.el-tag {
  margin-right: 10px;
}
</style>
