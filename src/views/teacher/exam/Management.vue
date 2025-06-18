<!-- views/teacher/exam/Management.vue -->
<template>
  <div class="exam-management">
    <el-card>
      <div slot="header" class="clearfix">
        <span>考试列表</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="$router.push('/teacher/exams/create')"
        >
          创建新考试
        </el-button>
      </div>

      <el-table :data="exams" style="width: 100%">
        <el-table-column prop="title" label="考试名称"></el-table-column>
        <el-table-column prop="subject" label="科目"></el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template slot-scope="{row}">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template slot-scope="{row}">
            {{ formatDate(row.endTime) }}
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
              @click="deleteExam(row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { fetchTeacherExams, deleteExam } from '@/api/exam'
import { formatDate } from '@/utils/date'

export default {
  data() {
    return {
      exams: []
    }
  },
  created() {
    this.fetchExams()
  },
  methods: {
    async fetchExams() {
      try {
        const { data } = await fetchTeacherExams()
        this.exams = data
      } catch (error) {
        this.$message.error('获取考试列表失败')
      }
    },
    formatDate,
    viewResults(examId) {
      this.$router.push(`/teacher/exams/${examId}/results`)
    },
    async deleteExam(examId) {
      try {
        await this.$confirm('确定删除此考试吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteExam(examId)
        this.$message.success('删除成功')
        this.fetchExams()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    }
  }
}
</script>
