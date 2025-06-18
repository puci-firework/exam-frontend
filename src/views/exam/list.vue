<template>
  <div class="exam-list-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>考试列表</span>
        <el-button
          v-if="isTeacher"
          style="float: right; padding: 3px 0"
          type="text"
          @click="createExam">
          创建考试
        </el-button>
      </div>

      <el-table
        :data="examList"
        v-loading="loading"
        empty-text="暂无考试"
        @row-click="handleRowClick">
        <el-table-column prop="title" label="考试名称" width="200" />
        <el-table-column label="考试时间" width="300">
          <template #default="{row}">
            {{ formatDateTime(row.startTime) }} ~
            {{ formatDateTime(row.endTime) }}
            <el-tag
              v-if="isExamActive(row)"
              type="success"
              size="mini">
              进行中
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="科目" width="120" />
        <el-table-column label="状态" width="120">
          <template #default="{row}">
            <el-tag :type="getStatusTagType(row)">
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{row}">
            <el-button-group>
              <el-button
                size="mini"
                @click.stop="handleViewDetail(row.id)">
                详情
              </el-button>
              <el-button
                size="mini"
                type="primary"
                @click.stop="handleStartExam(row.id)"
                :disabled="!canStartExam(row)">
                {{ isTeacher ? '批改' : '开始' }}
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getExamList } from '@/api/exam'
import { formatDateTime } from '@/utils/date'

export default {
  name: 'ExamList',
  data() {
    return {
      examList: [],
      loading: false
    }
  },
  computed: {
    isTeacher() {
      return ['TEACHER', 'ADMIN'].includes(this.$store.state.user.role)
    },
    isStudent() {
      return this.$store.state.user.role === 'STUDENT'
    }
  },
  created() {
    console
    this.fetchExamList()
  },
  methods: {
    async fetchExamList() {
      try {
        this.loading = true
        const { data } = await getExamList(this.$store.state.user.userId)
        this.examList = data
      } catch (error) {
        console.error('获取考试列表失败:', error)
        this.$message.error('获取考试列表失败')
      } finally {
        this.loading = false
      }
    },

    formatDateTime,

    isExamActive(exam) {
      const now = new Date()
      return now >= new Date(exam.startTime) && now <= new Date(exam.endTime)
    },

    getStatusText(exam) {
      const now = new Date()
      const start = new Date(exam.startTime)
      const end = new Date(exam.endTime)

      if (now < start) return '未开始'
      if (now > end) return '已结束'
      return '进行中'
    },

    getStatusTagType(exam) {
      const now = new Date()
      const start = new Date(exam.startTime)
      const end = new Date(exam.endTime)

      if (now < start) return 'info'
      if (now > end) return 'warning'
      return 'success'
    },

    canStartExam(exam) {
      if (this.isTeacher) return true

      const now = new Date()
      return now >= new Date(exam.startTime) && now <= new Date(exam.endTime)
    },

    handleRowClick(row) {
      this.$router.push(`/exam/detail/${row.id}`)
    },

    handleViewDetail(id) {
      this.$router.push(`/exam/detail/${id}`)
    },

    handleStartExam(id) {
      if (this.isTeacher) {
        this.$router.push(`/exam/review/${id}`)
      } else {
        // 先检查考试状态
        const exam = this.examList.find(e => e.id === id)

        if (!exam) {
          this.$message.error('考试不存在')
          return
        }

        const now = new Date()
        const startTime = new Date(exam.startTime)
        const endTime = new Date(exam.endTime)

        if (now < startTime) {
          this.$message.warning('考试尚未开始')
          return
        }

        if (now > endTime) {
          this.$message.warning('考试已结束')
          return
        }

        // 正常跳转到考试页面
        this.$router.push(`/exam/do/${id}`)
      }
    },

    createExam() {
      this.$router.push('/exam/create')
    }
  }
}
</script>

<style scoped>
.exam-list-container {
  padding: 20px;
}
</style>
