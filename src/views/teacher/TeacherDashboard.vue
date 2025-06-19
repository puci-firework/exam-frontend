<template>
  <div class="teacher-dashboard">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="dashboard-card">
          <div slot="header" class="card-header">
            <span class="card-title">我的考试</span>
            <el-button
              type="primary"
              size="mini"
              class="create-button"
              @click="showCreateExamDialog">
              <i class="el-icon-plus"></i> 创建考试
            </el-button>
          </div>
          <el-table :data="exams" style="width: 100%">
            <el-table-column prop="title" label="考试名称"></el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{row}">
                <el-tag :type="row.published ? 'success' : 'info'">
                  {{ row.published ? '已发布' : '未发布' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{row}">
                <el-button size="mini" @click="viewExamResults(row.id)">查看成绩</el-button>
                <el-button size="mini" type="danger" @click="deleteExam(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="dashboard-card">
          <div slot="header" class="card-header">
            <span class="card-title">我的作业</span>
            <el-button
              type="primary"
              size="mini"
              class="create-button"
              @click="showCreateHomeworkDialog">
              <i class="el-icon-plus"></i> 创建作业
            </el-button>
          </div>
          <el-table :data="homeworks" style="width: 100%">
            <el-table-column prop="title" label="作业名称"></el-table-column>
            <el-table-column prop="deadline" label="截止时间" width="180"></el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{row}">
                <el-button size="mini" @click="viewHomeworkResults(row.id)">查看成绩</el-button>
                <el-button size="mini" type="danger" @click="deleteHomework(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建考试对话框 -->
    <el-dialog :title="examDialogTitle" :visible.sync="examDialogVisible" width="50%">
      <exam-form
        v-if="examDialogVisible"
        :exam="currentExam"
        @submit="handleExamSubmit"
        @cancel="examDialogVisible = false"
      />
    </el-dialog>

    <!-- 创建作业对话框 -->
    <el-dialog :title="homeworkDialogTitle" :visible.sync="homeworkDialogVisible" width="50%">
      <homework-form
        v-if="homeworkDialogVisible"
        :homework="currentHomework"
        @submit="handleHomeworkSubmit"
        @cancel="homeworkDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  deleteExam,
  deleteHomework,
  createExam,
  createHomework
} from '@/api/teacher'
import { getExamList } from '@/api/exam'
import { getHomeworkList } from '@/api/homework'
import ExamForm from './ExamForm'
import HomeworkForm from './HomeworkForm'

export default {
  name: 'TeacherDashboard',
  components: { ExamForm, HomeworkForm },
  data() {
    return {
      exams: [],
      homeworks: [],
      examDialogVisible: false,
      homeworkDialogVisible: false,
      currentExam: null,
      currentHomework: null,
      examDialogTitle: '创建考试',
      homeworkDialogTitle: '创建作业'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const examsRes = await getExamList(this.$store.state.user.userId)
        this.exams = examsRes.data

        const homeworksRes = await getHomeworkList(this.$store.state.user.userId)
        this.homeworks = homeworksRes.data
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    },
    showCreateExamDialog() {
      this.$router.push('/teacher/exams')
    },
    showCreateHomeworkDialog() {
      this.$router.push('/teacher/homeworks')
    },
    viewExamResults(examId) {
      this.$router.push(`/teacher/exams/${examId}/results`)
    },
    viewHomeworkResults(homeworkId) {
      this.$router.push(`/teacher/homeworks/${homeworkId}/results`)
    },
    async deleteExam(examId) {
      try {
        await this.$confirm('确定删除此考试吗?', '提示', { type: 'warning' })
        await deleteExam(examId)
        this.$message.success('删除成功')
        await this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    async deleteHomework(homeworkId) {
      try {
        await this.$confirm('确定删除此作业吗?', '提示', { type: 'warning' })
        await deleteHomework(homeworkId)
        this.$message.success('删除成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    async handleExamSubmit(examData) {
      try {
        await createExam(examData) // 调用API接口
        this.$message.success('考试创建成功')
        this.examDialogVisible = false
        this.fetchData() // 刷新列表
      } catch (error) {
        console.error('创建考试失败:', error)
        this.$message.error('创建考试失败')
      }
    },
    async handleHomeworkSubmit(homeworkData) {
      try {
        await createHomework(homeworkData) // 调用API接口
        this.$message.success('作业创建成功')
        this.homeworkDialogVisible = false
        this.fetchData() // 刷新列表
      } catch (error) {
        console.error('创建作业失败:', error)
        this.$message.error('创建作业失败')
      }
    }
  }
}
</script>

<style scoped>
.teacher-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
}

.dashboard-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
}

.create-button {
  margin-left: auto; /* 将按钮推到最右侧 */
}

.el-table {
  margin-top: 10px;
}

@media (max-width: 1200px) {
  .el-col {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>
