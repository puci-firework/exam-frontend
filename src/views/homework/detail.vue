<template>
  <div class="homework-detail-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>作业详情</span>
        <el-button
          v-if="!isTeacher && !detail.hasSubmitted"
          style="float: right; padding: 3px 0"
          type="text"
          @click="startHomework">
          开始作业
        </el-button>
      </div>

      <div class="homework-info">
        <h2>{{ detail.title }}</h2>
        <div class="meta-info">
          <span>科目: {{ detail.subject }}</span>
          <span>截止时间: {{ formatDateTime(detail.deadline) }}</span>
          <span v-if="detail.hasSubmitted" class="status-submitted">已提交</span>
        </div>
        <div class="description">
          {{ detail.description }}
        </div>
      </div>

      <el-divider></el-divider>

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
import { getHomeworkDetail } from '@/api/homework'
import { formatDateTime } from '@/utils/date'

export default {
  name: 'HomeworkDetail',
  data() {
    return {
      detail: {
        title: '',
        subject: '',
        deadline: '',
        description: '',
        hasSubmitted: false,
        questions: []
      },
      loading: false,
      isTeacher: this.$store.state.user.role === 'TEACHER'
    }
  },
  created() {
    this.fetchHomeworkDetail()
  },
  methods: {
    async fetchHomeworkDetail() {
      try {
        this.loading = true
        const { data } = await getHomeworkDetail(this.$route.params.id)
        this.detail = data
      } catch (error) {
        console.error('获取作业详情失败:', error)
        this.$message.error('获取作业详情失败')
      } finally {
        this.loading = false
      }
    },

    formatDateTime,

    startHomework() {
      this.$router.push(`/homework/do/${this.$route.params.id}`)
    }
  }
}
</script>

<style scoped>
.homework-detail-container {
  padding: 20px;
}

.homework-info {
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

.status-submitted {
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
