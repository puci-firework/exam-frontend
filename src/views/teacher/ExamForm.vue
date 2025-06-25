<template>
  <el-form :model="exam" label-width="100px" :rules="rules" ref="examForm">
    <el-form-item label="考试标题" prop="title">
      <el-input v-model="exam.title"></el-input>
    </el-form-item>
    <el-form-item label="科目" prop="subject">
      <el-input v-model="exam.subject"></el-input>
    </el-form-item>
    <el-form-item label="考试描述" prop="description">
      <el-input type="textarea" v-model="exam.description"></el-input>
    </el-form-item>
    <!-- 考试时间设置 -->
    <el-row>
      <el-col :span="12">
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="exam.startTime"
            type="datetime"
            placeholder="选择开始时间"
            :disabled-date="disablePastDates"
            :picker-options="startTimePickerOptions"
            value-format="yyyy-MM-dd HH:mm:ss">
          </el-date-picker>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="exam.endTime"
            type="datetime"
            placeholder="选择结束时间"
            :disabled-date="disablePastDates"
            :picker-options="endTimePickerOptions"
            value-format="yyyy-MM-dd HH:mm:ss">
          </el-date-picker>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="考试时长(分钟)" prop="duration">
      <el-input-number v-model="exam.duration" :min="1"></el-input-number>
    </el-form-item>

    <el-divider>考试题目</el-divider>
    <question-editor :questions="exam.questions" @update="updateQuestions"/>

    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import QuestionEditor from './components/QuestionEditor'
import { createExam } from '@/api/teacher' // 导入API方法

export default {
  name: 'ExamForm',
  components: { QuestionEditor },
  props: {
    exam: {
      type: Object,
      default: () => ({
        title: '',
        subject: '',
        description: '',
        startTime: '',
        endTime: '',
        duration: 60,
        questions: []
      })
    }
  },
  data() {
    return {
      submitting: false, // 添加提交状态
      rules: {
        title: [{ required: true, message: '请输入考试标题', trigger: 'blur' }],
        subject: [{ required: true, message: '请输入科目', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        duration: [{ required: true, message: '请输入考试时长', trigger: 'blur' }]
      },
      // 开始时间选择器配置
      startTimePickerOptions: {
        disabledDate: this.disablePastDates
      },

      // 结束时间选择器配置
      endTimePickerOptions: {
        disabledDate: (time) => {
          // 结束时间不能早于开始时间
          const startTime = this.exam.startTime ? new Date(this.exam.startTime).getTime() : 0
          return time.getTime() < startTime || this.disablePastDates(time)
        }
      }
    }
  },
  methods: {
    // 禁用过去的时间
    disablePastDates(time) {
      return time.getTime() < Date.now() - 60000
    },
    formatToISO(dateString) {
      if (!dateString) return null
      return dateString.replace(' ', 'T')
    },
    updateQuestions(questions) {
      this.exam.questions = questions
    },
    async submitForm() {
      try {
        const valid = await this.$refs.examForm.validate()
        if (!valid) return

        if (this.exam.questions.length === 0) {
          this.$message.warning('请至少添加一道题目')
          return
        }

        this.submitting = true

        const examData = {
          title: this.exam.title,
          subject: this.exam.subject,
          description: this.exam.description,
          startTime: this.formatToISO(this.exam.startTime), // 修改这里
          endTime: this.formatToISO(this.exam.endTime), // 修改这里
          duration: this.exam.duration,
          teacherId: this.$store.state.user.userId,
          questions: this.exam.questions.map(q => ({
            content: q.content,
            type: q.type || 'single',
            options: Array.isArray(q.options) ? JSON.stringify(q.options) : q.options,
            answer: Array.isArray(q.answer) ? JSON.stringify(q.answer) : q.answer,
            score: q.score || 0,
            subject: this.exam.subject
          }))
        }

        // 调用API接口
        const response = await createExam(examData)

        this.$message.success('考试创建成功')
        this.$emit('submit-success', response.data) // 新增提交成功事件
        this.$router.push('/teacher/dashboard')
      } catch (error) {
        console.error('提交考试失败:', error)
        this.$message.error(`提交失败: ${error.message || '未知错误'}`)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>
