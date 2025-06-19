<template>
  <el-form :model="homework" label-width="100px" :rules="rules" ref="homeworkForm">
    <el-form-item label="作业标题" prop="title">
      <el-input v-model="homework.title"></el-input>
    </el-form-item>
    <el-form-item label="科目" prop="subject">
      <el-input v-model="homework.subject"></el-input>
    </el-form-item>
    <el-form-item label="作业描述" prop="description">
      <el-input type="textarea" v-model="homework.description"></el-input>
    </el-form-item>
    <el-form-item label="截止时间" prop="deadline">
      <el-date-picker
        v-model="homework.deadline"
        type="datetime"
        placeholder="选择截止时间">
      </el-date-picker>
    </el-form-item>

    <el-divider>作业题目</el-divider>
    <question-editor :questions="homework.questions" @update="updateQuestions"/>

    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import QuestionEditor from './components/QuestionEditor'
import { createHomework } from '@/api/teacher'

export default {
  name: 'HomeworkForm',
  components: { QuestionEditor },
  props: {
    homework: {
      type: Object,
      default: () => ({
        title: '',
        subject: '',
        description: '',
        deadline: '',
        questions: []
      })
    }
  },
  data() {
    return {
      submmitting: false,
      rules: {
        title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
        subject: [{ required: true, message: '请输入科目', trigger: 'blur' }],
        deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
      }
    }
  },
  methods: {
    updateQuestions(questions) {
      this.homework.questions = questions
    },
    formatDateTime(date) {
      return new Date(date).toISOString().split('.')[0] // 格式化为"YYYY-MM-DDTHH:mm:ss"
    },
    async submitForm() {
      try {
        const valid = await this.$refs.homeworkForm.validate()
        if (!valid) return

        if (this.homework.questions.length === 0) {
          this.$message.warning('请至少添加一道题目')
          return
        }

        this.submitting = true

        const homeworkData = {
          title: this.homework.title,
          subject: this.homework.subject,
          description: this.homework.description,
          deadline: this.formatDateTime(this.homework.deadline),
          teacherId: this.$store.state.user.userId,
          questions: this.homework.questions.map(q => ({
            content: q.content,
            type: q.type || 'SINGLE_CHOICE',
            options: Array.isArray(q.options) ? JSON.stringify(q.options) : q.options,
            answer: Array.isArray(q.answer) ? JSON.stringify(q.answer) : q.answer,
            score: q.score || 0,
            subject: this.homework.subject
          }))
        }

        // 调用API接口
        const response = await createHomework(homeworkData)

        this.$message.success('作业创建成功')
        this.$emit('submit-success', response.data) // 新增提交成功事件
        this.$router.push('/teacher/dashboard')
      } catch (error) {
        console.error('提交作业失败:', error)
        this.$message.error(`提交失败: ${error.message || '未知错误'}`)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>
