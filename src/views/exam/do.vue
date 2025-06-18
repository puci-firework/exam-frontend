<template>
  <div class="do-exam-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>{{ exam.title }}</span>
        <div style="float: right">
          <span class="time-remaining">剩余时间: {{ formattedTime }}</span>
          <el-button
            size="mini"
            type="primary"
            @click="submitExam"
            :loading="submitting">
            提交试卷
          </el-button>
        </div>
      </div>

      <el-form
        ref="form"
        :model="form"
        label-position="top">
        <div
          v-for="(q, index) in exam.questions"
          :key="q.id"
          class="question-item">
          <el-form-item
            :label="`${index + 1}. ${q.content} (${q.score}分)`"
            :prop="`answers.${index}.answer`"
            :rules="getValidationRules(q.type)">
            <!-- 单选题 -->
            <el-radio-group
              v-if="q.type === 'SINGLE_CHOICE'"
              v-model="form.answers[index].answer">
              <el-radio
                v-for="(option, optIndex) in parseOptions(q.options)"
                :key="optIndex"
                :label="option">
                {{ option }}
              </el-radio>
            </el-radio-group>

            <!-- 多选题 -->
            <el-checkbox-group
              v-else-if="q.type === 'MULTIPLE_CHOICE'"
              v-model="form.answers[index].answer">
              <el-checkbox
                v-for="(option, optIndex) in parseOptions(q.options)"
                :key="optIndex"
                :label="option">
                {{ option }}
              </el-checkbox>
            </el-checkbox-group>

            <!-- 判断题 -->
            <el-radio-group
              v-else-if="q.type === 'TRUE_FALSE'"
              v-model="form.answers[index].answer">
              <el-radio label="正确">正确</el-radio>
              <el-radio label="错误">错误</el-radio>
            </el-radio-group>

            <!-- 简答题/编程题 -->
            <el-input
              v-else
              type="textarea"
              :rows="q.type === 'SHORT_ANSWER' ? 3 : 6"
              v-model="form.answers[index].answer"
              :placeholder="getPlaceholder(q.type)">
            </el-input>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { startExam, submitExam, getExamTimeRemaining } from '@/api/exam'
import { formatTime } from '@/utils/date'

export default {
  name: 'DoExam',
  data() {
    return {
      exam: {
        title: '',
        questions: []
      },
      form: {
        answers: []
      },
      timeRemaining: 0, // 剩余秒数
      timer: null,
      submitting: false
    }
  },
  computed: {
    formattedTime() {
      return formatTime(this.timeRemaining)
    }
  },
  created() {
    console.log('调用startExam参数:', this.$store.state.user.role)
    if (this.$store.state.user.role !== 'STUDENT') {
      this.$message.error('只有学生可以参加考试')
      this.$router.push('/exam')
      return
    }
    this.initExam()
    this.startTimer()
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    async initExam() {
      try {
        const response = await startExam(
          this.$route.params.id,
          this.$route.query.studentId || this.$store.state.user.userId
        )

        // 检查响应状态码
        if (response.status !== 200) {
          const errorMessage = response.data?.message || '考试初始化失败'
          this.handleExamError(errorMessage)
          return
        }

        this.exam = response.data
        this.timeRemaining = response.data.remainingTime || 0

        // 初始化答案表单
        this.form.answers = response.data.questions.map(q => ({
          questionId: q.id,
          answer: q.type === 'MULTIPLE_CHOICE' ? [] : ''
        }))
      } catch (error) {
        console.error('初始化考试失败:', error)
        this.handleExamError(error.response?.headers['x-error-message'] || error.message)
      }
    },

    handleExamError(errorMessage) {
      if (!errorMessage) {
        errorMessage = '初始化考试失败，请稍后再试'
      }

      this.$message.error(errorMessage)

      // 根据错误类型执行不同操作
      if (errorMessage.includes('您已经参加过本次考试')) {
        this.$router.push(`/exam/detail/${this.$route.params.id}`)
      } else if (errorMessage.includes('尚未开始')) {
        this.$router.push(`/exam/detail/${this.$route.params.id}`)
      } else if (errorMessage.includes('已结束')) {
        this.$router.push('/exam/list')
      } else {
        this.$router.go(-1) // 返回上一页
      }
    },

    startTimer() {
      this.timer = setInterval(async() => {
        if (this.timeRemaining <= 0) {
          clearInterval(this.timer)
          this.$message.warning('考试时间已结束，将自动提交')
          await this.submitExam()
          return
        }

        this.timeRemaining--

        // 每分钟同步一次服务器时间
        if (this.timeRemaining % 60 === 0) {
          this.syncServerTime()
        }
      }, 1000)
    },

    async syncServerTime() {
      try {
        const { data } = await getExamTimeRemaining(
          this.$route.params.id,
          this.$store.state.user.userId
        )
        this.timeRemaining = data
      } catch (error) {
        console.error('同步考试时间失败:', error)
      }
    },

    parseOptions(options) {
      try {
        return JSON.parse(options)
      } catch {
        return options.split(',')
      }
    },

    getValidationRules(type) {
      const required = { required: true, message: '请完成此题', trigger: 'blur' }

      if (type === 'MULTIPLE_CHOICE') {
        return {
          type: 'array',
          min: 1,
          message: '请至少选择一个选项',
          trigger: 'change'
        }
      }

      return required
    },

    getPlaceholder(type) {
      const map = {
        'SHORT_ANSWER': '请输入简要答案',
        'PROGRAMMING': '请输入代码实现',
        'ESSAY': '请输入详细解答'
      }
      return map[type] || '请输入答案'
    },

    async submitExam() {
      try {
        this.submitting = true
        await this.$refs.form.validate()

        await submitExam(
          this.$route.params.id,
          this.$store.state.user.userId,
          this.form.answers
        )

        this.$message.success('考试提交成功')
        this.$router.push('/exam')
      } catch (error) {
        console.error('提交考试失败:', error)
        if (error.response && error.response.status === 400) {
          this.$message.error('考试已结束，无法提交')
        } else {
          this.$message.error('提交考试失败: ' + (error.message || '未知错误'))
        }
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.do-exam-container {
  padding: 20px;
}

.time-remaining {
  margin-right: 20px;
  color: #f56c6c;
  font-weight: bold;
}

.question-item {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.question-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
