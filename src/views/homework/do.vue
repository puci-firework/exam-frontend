<template>
  <div class="do-homework-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>{{ homework.title }}</span>
        <div style="float: right">
          <span class="time-remaining">剩余时间: {{ formattedTime }}</span>
          <el-button-group>
            <el-button
              size="mini"
              @click="saveDraft"
              :loading="savingDraft">
              保存草稿
            </el-button>
            <el-button
              size="mini"
              type="primary"
              @click="submitHomework"
              :loading="submitting">
              提交作业
            </el-button>
          </el-button-group>
        </div>
      </div>

      <el-form
        ref="form"
        :model="form"
        label-position="top"
      >
        <div
          v-for="(q, index) in homework.questions"
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
import { startHomework, submitHomework, saveHomeworkDraft } from '@/api/homework'
import { formatTime } from '@/utils/date'

export default {
  name: 'DoHomework',
  data() {
    return {
      homework: {
        title: '',
        questions: []
      },
      form: {
        answers: []
      },
      timeRemaining: 0,
      timer: null,
      submitting: false,
      savingDraft: false
    }
  },
  computed: {
    formattedTime() {
      return formatTime(this.timeRemaining)
    }
  },
  created() {
    this.initHomework()
    this.startTimer()
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    async initHomework() {
      try {
        const response = await startHomework(
          this.$route.params.id,
          this.$store.state.user.userId
        )

        if (response.status !== 200) {
          const errorMessage = response.data?.message || '作业初始化失败'
          this.handleHomeworkError(errorMessage)
          return
        }

        this.homework = response.data
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
        this.handleHomeworkError(error.response?.data?.message || error.message)
      }
    },

    handleHomeworkError(errorMessage) {
      if (!errorMessage) errorMessage = '初始化作业失败，请稍后再试'

      this.$message.error(errorMessage)
      this.$router.go(-1)
    },

    parseOptions(options) {
      try {
        return JSON.parse(options)
      } catch (e) {
        return []
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

    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeRemaining <= 0) {
          clearInterval(this.timer)
          this.$message.warning('作业时间已结束，请立即提交')
          return
        }
        this.timeRemaining--
      }, 1000)
    },

    async submitHomework() {
      try {
        this.submitting = true
        const valid = await this.$refs.form.validate()
        if (!valid) return

        // 构建符合后端要求的提交数据
        const submitData = this.form.answers.map(item => ({
          questionId: item.questionId,
          answer: item.answer
        }))

        await submitHomework(
          this.$route.params.id,
          this.$store.state.user.userId,
          submitData
        )

        this.$message.success('作业提交成功')
        this.$router.push('/homework')
      } catch (error) {
        console.error('提交作业失败:', error)

        if (error.response) {
          if (error.response.status === 400) {
            this.$message.error(error.response.data.message || '作业已截止，无法提交')
          } else {
            this.$message.error(`提交失败: ${error.response.data.message || '服务器错误'}`)
          }
        } else {
          this.$message.error('提交作业失败: ' + (error.message || '未知错误'))
        }
      } finally {
        this.submitting = false
      }
    },

    async saveDraft() {
      try {
        this.savingDraft = true

        // 构建草稿数据
        const draftData = this.form.answers.map(item => ({
          questionId: item.questionId,
          answer: item.answer
        }))

        await saveHomeworkDraft(
          this.$route.params.id,
          this.$store.state.user.userId,
          draftData
        )

        this.$message.success('草稿保存成功')
      } catch (error) {
        console.error('保存草稿失败:', error)
        this.$message.error('保存草稿失败: ' + (error.message || '未知错误'))
      } finally {
        this.savingDraft = false
      }
    }
  }
}
</script>

<style scoped>
.do-homework-container {
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
