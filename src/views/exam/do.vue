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
            :loading="submitting"
            @click="submitExam"
          >
            提交试卷
          </el-button>
        </div>
      </div>

      <el-form
        ref="form"
        :model="form"
        label-position="top"
      >
        <div
          v-for="(q, index) in exam.questions"
          :key="q.id"
          class="question-item"
        >
          <el-form-item
            :label="`${index + 1}. ${q.content} (${q.score}分)`"
            :prop="`answers.${index}.answer`"
            :rules="getValidationRules(q.type)"
          >
            <!-- 单选题 -->
            <el-radio-group
              v-if="q.type === 'single'"
              v-model="form.answers[index].answer"
            >
              <el-radio
                v-for="(option, optIndex) in parseOptions(q.options)"
                :key="optIndex"
                :label="optIndex.toString()"
              >
                {{ option }}
              </el-radio>
            </el-radio-group>

            <!-- 多选题 -->
            <el-checkbox-group
              v-else-if="q.type === 'multiple'"
              v-model="form.answers[index].selectedValues"
              @change="updateMultipleAnswer(index)"
            >
              <el-checkbox
                v-for="(option, optIndex) in parseOptions(q.options)"
                :key="optIndex"
                :label="optIndex"
              >
                {{ option }}
              </el-checkbox>
            </el-checkbox-group>

            <!-- 判断题 -->
            <el-radio-group
              v-else-if="q.type === 'judge'"
              v-model="form.answers[index].answer"
            >
              <el-radio label="true">正确</el-radio>
              <el-radio label="false">错误</el-radio>
            </el-radio-group>

            <!-- 简答题 -->
            <el-input
              v-else-if="q.type === 'short'"
              v-model.trim="form.answers[index].answer"
              type="textarea"
              :rows="3"
              placeholder="请输入答案"
            />
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
        subject: '',
        questions: []
      },
      form: {
        answers: []
      },
      timeRemaining: 0,
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
    parseOptions(options) {
      try {
        return JSON.parse(options)
      } catch (e) {
        return []
      }
    },

    async initExam() {
      try {
        const response = await startExam(
          this.$route.params.id,
          this.$store.state.user.userId
        )

        if (response.status !== 200) {
          const errorMessage = response.data?.message || '考试初始化失败'
          this.handleExamError(errorMessage)
          return
        }

        this.exam = response.data
        this.timeRemaining = response.data.remainingTime || 0

        this.form.answers = response.data.questions.map(question => {
          const answerObj = {
            questionId: question.id,
            type: question.type,
            answer: ''
          }

          // 特殊处理多选题
          if (question.type === 'multiple') {
            answerObj.selectedValues = []
          }

          return answerObj
        })
      } catch (error) {
        this.handleExamError(error.response?.data?.message || error.message)
      }
    },

    handleExamError(errorMessage) {
      if (!errorMessage) errorMessage = '初始化考试失败，请稍后再试'

      this.$message.error(errorMessage)

      if (errorMessage.includes('您已经参加过本次考试')) {
        this.$router.push(`/exam/detail/${this.$route.params.id}`)
      } else if (errorMessage.includes('尚未开始')) {
        this.$router.push(`/exam/detail/${this.$route.params.id}`)
      } else if (errorMessage.includes('已结束')) {
        this.$router.push('/exam/list')
      } else {
        this.$router.go(-1)
      }
    },

    updateMultipleAnswer(index) {
      const stringIndices = this.form.answers[index].selectedValues.map(num => num.toString())
      this.form.answers[index].answer = JSON.stringify(stringIndices)
    },

    getValidationRules(type) {
      const required = {
        required: true,
        message: '请完成此题',
        trigger: 'blur'
      }

      if (type === 'multiple') {
        return {
          validator: (rule, value, callback) => {
            const answer = this.form.answers[rule.field.split('.')[1]]
            if (!answer.selectedValues || answer.selectedValues.length === 0) {
              callback(new Error('请至少选择一个选项'))
            } else {
              callback()
            }
          },
          trigger: 'change'
        }
      }

      return required
    },

    async submitExam() {
      try {
        this.submitting = true
        const valid = await this.$refs.form.validate()
        if (!valid) return

        // 构建符合后端要求的提交数据
        const submitData = this.form.answers.map(item => ({
          questionId: item.questionId,
          answer: item.answer
        }))

        // 调试输出
        console.log('提交数据:', JSON.stringify(submitData, null, 2))

        await submitExam(
          this.$route.params.id,
          this.$store.state.user.userId,
          submitData
        )

        this.$message.success('考试提交成功')
        this.$router.push('/exam')
      } catch (error) {
        console.error('提交考试失败:', error)

        if (error.response) {
          if (error.response.status === 400) {
            this.$message.error(error.response.data.message || '考试已结束，无法提交')
          } else {
            this.$message.error(`提交失败: ${error.response.data.message || '服务器错误'}`)
          }
        } else {
          this.$message.error('提交考试失败: ' + (error.message || '未知错误'))
        }
      } finally {
        this.submitting = false
      }
    },

    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeRemaining <= 0) {
          clearInterval(this.timer)
          this.$message.warning('考试时间已结束，请立即提交试卷')
          return
        }
        this.timeRemaining--
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
