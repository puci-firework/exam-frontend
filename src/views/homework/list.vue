<template>
  <div class="homework-list-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>作业列表</span>
        <el-button
          v-if="isTeacher"
          style="float: right; padding: 3px 0"
          type="text"
          @click="createHomework">
          新建作业
        </el-button>
      </div>

      <el-table
        :data="homeworkList"
        v-loading="loading"
        empty-text="暂无作业"
        @row-click="handleRowClick">
        <el-table-column prop="title" label="作业名称" width="200" />
        <el-table-column prop="subject" label="科目" width="120" />
        <el-table-column label="截止时间" width="180">
          <template #default="{row}">
            {{ formatDateTime(row.deadline) }}
            <el-tag
              v-if="isUrgent(row.deadline)"
              type="danger"
              size="mini">
              即将截止
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{row}">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
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
                @click.stop="handleStartHomework(row.id)"
                :disabled="row.status !== 'pending'">
                {{ isTeacher ? '' : '开始' }}
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getHomeworkList } from '@/api/homework'
import { formatDateTime } from '@/utils/date'

export default {
  name: 'HomeworkList',
  data() {
    return {
      homeworkList: [],
      loading: false,
      isTeacher: this.$store.state.user.role === 'TEACHER'
    }
  },
  created() {
    this.fetchHomeworkList()
  },
  methods: {
    async fetchHomeworkList() {
      try {
        this.loading = true
        const { data } = await getHomeworkList(this.$store.state.user.userId)
        this.homeworkList = data.map(item => ({
          ...item,
          status: this.calculateStatus(item)
        }))
      } catch (error) {
        console.error('获取作业列表失败:', error)
        this.$message.error('获取作业列表失败')
      } finally {
        this.loading = false
      }
    },

    calculateStatus(homework) {
      const now = new Date()
      const deadline = new Date(homework.deadline)

      // 老师看到的作业没有状态
      if (this.isTeacher) return 'published'

      // 学生作业状态
      if (homework.hasSubmitted) return 'submitted'
      if (now > deadline) return 'expired'
      return 'pending'
    },

    formatDateTime,

    isUrgent(deadline) {
      const dueDate = new Date(deadline)
      const now = new Date()
      const diffHours = (dueDate - now) / (1000 * 60 * 60)
      return diffHours > 0 && diffHours < 24
    },

    getStatusText(status) {
      const map = {
        published: '已发布',
        pending: '待完成',
        submitted: '已提交',
        expired: '已截止'
      }
      return map[status] || '未知状态'
    },

    getStatusTagType(status) {
      const map = {
        published: '',
        pending: 'warning',
        submitted: 'success',
        expired: 'danger'
      }
      return map[status] || 'info'
    },

    handleRowClick(row) {
      this.$router.push(`/homework/detail/${row.id}`)
    },

    handleViewDetail(id) {
      this.$router.push(`/homework/detail/${id}`)
    },

    handleStartHomework(id) {
      if (this.isTeacher) {
        this.$router.push(`/homework/review/${id}`)
      } else {
        this.$router.push(`/homework/do/${id}`)
      }
    },

    createHomework() {
      this.$router.push('/teacher/homeworks')
    }
  }
}
</script>

<style scoped>
.homework-list-container {
  padding: 20px;
}
</style>
