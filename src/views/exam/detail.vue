<template>
  <div class="exam-detail-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>考试详情</span>
        <el-button
          v-if="!isTeacher && !detail.hasTaken && isExamActive"
          style="float: right; padding: 3px 0"
          type="text"
          @click="startExam"
        >
          开始考试
        </el-button>
      </div>

      <div class="exam-info">
        <h2>{{ detail.title }}</h2>
        <div class="meta-info">
          <span>科目: {{ detail.subject }}</span>
          <span>考试时间: {{ formatDateTime(detail.startTime) }} ~ {{ formatDateTime(detail.endTime) }}</span>
          <span>时长: {{ detail.duration }}分钟</span>
          <span v-if="detail.hasTaken" class="status-taken">已参加</span>
        </div>
        <div class="description">
          {{ detail.description }}
        </div>
      </div>

      <el-divider />

      <div class="question-list">
        <h3>题目列表</h3>
        <div v-for="(q, index) in detail.questions" :key="q.id" class="question-item">
          <div class="question-content">
            <span class="question-index">{{ index + 1 }}.</span>
            <span>{{ q.content }}</span>
            <span class="question-score">({{ q.score }}分)</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getExamDetail } from '@/api/exam'
import { formatDateTime } from '@/utils/date'
import { ROLES } from '@/utils/constants'

export default {
  name: 'ExamDetail',
  data() {
    return {
      detail: {
        title: '',
        subject: '',
        startTime: '',
        endTime: '',
        duration: 0,
        description: '',
        hasTaken: false,
        questions: []
      },
      loading: false
    }
  },
  computed: {
    isTeacher() {
      return [ROLES.TEACHER, ROLES.ADMIN].includes(this.$store.state.user.role)
    },
    isStudent() {
      return this.$store.state.user.role === ROLES.STUDENT
    },
    isExamActive() {
      const now = new Date()
      return now >= new Date(this.detail.startTime) && now <= new Date(this.detail.endTime)
    }
  },
  created() {
    this.fetchExamDetail()
  },
  methods: {
    async fetchExamDetail() {
      try {
        this.loading = true
        const { data } = await getExamDetail(this.$route.params.id)
        this.detail = data
      } catch (error) {
        console.error('获取考试详情失败:', error)
        this.$message.error('获取考试详情失败')
      } finally {
        this.loading = false
      }
    },

    formatDateTime,

    startExam() {
      // 在开始考试前检查考试状态
      const now = new Date()
      const startTime = new Date(this.detail.startTime)
      const endTime = new Date(this.detail.endTime)

      if (now < startTime) {
        this.$message.warning('考试尚未开始')
        return
      }

      if (now > endTime) {
        this.$message.warning('考试已结束')
        return
      }

      if (this.detail.hasTaken) {
        this.$message.warning('您已参加过本次考试')
        return
      }
      this.$router.push(`/exam/do/${this.$route.params.id}`)
    }
  }
}
</script>

<style scoped>
.exam-detail-container {
  padding: 20px;
}

.exam-info {
  margin-bottom: 20px;
}

.meta-info {
  margin: 10px 0;
  color: #666;
  font-size: 14px;
}

.meta-info span {
  margin-right: 20px;
}

.status-taken {
  color: #67C23A;
}

.description {
  margin-top: 15px;
  line-height: 1.6;
}

.question-list {
  margin-top: 20px;
}

.question-item {
  margin: 10px 0;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.question-content {
  display: flex;
  align-items: baseline;
}

.question-index {
  margin-right: 8px;
  font-weight: bold;
}

.question-score {
  margin-left: auto;
  color: #E6A23C;
}
</style>
