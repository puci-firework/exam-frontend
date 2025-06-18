<!-- views/teacher/homework/Management.vue -->
<template>
  <div class="homework-management">
    <el-card>
      <div slot="header" class="clearfix">
        <span>作业列表</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="$router.push('/teacher/homeworks/create')"
        >
          创建新作业
        </el-button>
      </div>

      <el-table :data="homeworks" style="width: 100%">
        <el-table-column prop="title" label="作业名称"></el-table-column>
        <el-table-column prop="subject" label="科目"></el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="180">
          <template slot-scope="{row}">
            {{ formatDate(row.deadline) }}
          </template>
        </el-table-column>
        <el-table-column label="完成情况">
          <template slot-scope="{row}">
            <el-tag :type="row.completionRate === 1 ? 'success' : 'warning'">
              {{ Math.round(row.completionRate * 100) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="{row}">
            <el-button
              size="mini"
              @click="viewResults(row.id)"
            >查看成绩</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="deleteHomework(row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { fetchTeacherHomeworks, deleteHomework } from '@/api/homework'
import { formatDate } from '@/utils/date'

export default {
  data() {
    return {
      homeworks: []
    }
  },
  created() {
    this.fetchHomeworks()
  },
  methods: {
    async fetchHomeworks() {
      try {
        const { data } = await fetchTeacherHomeworks()
        this.homeworks = data.map(hw => ({
          ...hw,
          completionRate: hw.completedCount / hw.totalStudents || 0
        }))
      } catch (error) {
        this.$message.error('获取作业列表失败')
      }
    },
    formatDate,
    viewResults(homeworkId) {
      this.$router.push(`/teacher/homeworks/${homeworkId}/results`)
    },
    async deleteHomework(homeworkId) {
      try {
        await this.$confirm('确定删除此作业吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteHomework(homeworkId)
        this.$message.success('删除成功')
        this.fetchHomeworks()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    }
  }
}
</script>
