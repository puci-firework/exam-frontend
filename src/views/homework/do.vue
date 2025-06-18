<template>
  <div class="do-homework-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>{{ homework.title }}</span>
        <el-button-group style="float: right">
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

      <div class="time-remaining" v-if="timeRemaining">
        剩余时间: {{ timeRemaining }}
      </div>

      <el-form
        ref="form"
        :model="form"
        label-position="top">
        <div
          v-for="(q, index) in homework.questions"
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
import { startHomework, submitHomework, saveHomeworkDraft } from '@/api/homework'
import { formatDateTime } from '@/utils/date'

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
      timeRemaining: '',
      timer: null,
      deadline: null,
      submitting: false,
      savingDraft: false
    }
  },
  created() {
    this.initHomework()
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    async initHomework() {
      try {
        const { data } = await startHomework(
          this.$route.params.id,
          this.$store.state.user.userId
        )

        this.homework = data
        this.deadline = new Date(data.deadline)

        // 初始化答案表单
        this.form.answers = data.questions.map(q => ({
          questionId: q.id,
          answer: ''
        }))

        // 启动倒计时
        this.startTimer()
      } catch (error) {
        console.error('初始化作业失败:', error)
        this.$message.error('初始化作业失败')
        this.$router.go(-1)
      }
    },

    startTimer() {
      this.updateTimeRemaining()
      this.timer = setInterval(() => {
        this.updateTimeRemaining()
      }, 1000)
    },

    updateTimeRemaining() {
      const now = new Date()
      const diff = this.deadline - now

      if (diff <= 0) {
        clearInterval(this.timer)
        this.timeRemaining = '已截止'
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      this.timeRemaining = `${hours}小时 ${minutes}分钟 ${seconds}秒`
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

    async submitHomework() {
      try {
        this.submitting = true
        await this.$refs.form.validate()

        await submitHomework(
          this.$route.params.id,
          this.$store.state.user.userId,
          this.form.answers
        )

        this.$message.success('作业提交成功')
        this.$router.push('/homework')
      } catch (error) {
        console.error('提交作业失败:', error)
        if (error.response && error.response.status === 400) {
          this.$message.error('作业已截止，无法提交')
        } else {
          this.$message.error('提交作业失败')
        }
      } finally {
        this.submitting = false
      }
    },

    async saveDraft() {
      try {
        this.savingDraft = true

        await saveHomeworkDraft(
          this.$route.params.id,
          this.$store.state.user.userId,
          this.form.answers
        )

        this.$message.success('草稿保存成功')
      } catch (error) {
        console.error('保存草稿失败:', error)
        this.$message.error('保存草稿失败')
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
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f4f4f5;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
  color: #f56c6c;
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
