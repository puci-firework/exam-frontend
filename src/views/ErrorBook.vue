<!-- src/views/ErrorBook.vue -->
<template>
  <div class="error-book-container">
    <div class="header">
      <h1>我的错题本</h1>
      <div class="actions">
        <el-select v-model="selectedSubject" placeholder="按科目筛选" @change="filterBySubject">
          <el-option label="全部科目" value="" />
          <el-option
            v-for="subject in subjects"
            :key="subject"
            :label="subject"
            :value="subject"
          />
        </el-select>
        <el-button type="primary" @click="generatePracticePaper">
          生成练习试卷(10题)
        </el-button>
      </div>
    </div>

    <div class="error-list">
      <el-card v-for="error in errorQuestions" :key="error.id" class="error-card">
        <div slot="header" class="clearfix">
          <span class="question-subject">{{ error.question.subject }}</span>
          <span class="question-type">{{ error.question.type }}</span>
          <el-button
            style="float: right; padding: 3px 0"
            type="text"
            @click="removeFromErrorBook(error.question.id)"
          >
            标记为已掌握
          </el-button>
        </div>

        <div class="question-content">
          <p v-html="error.question.content" />

          <div v-if="error.question.options" class="question-options">
            <p
              v-for="(option, index) in parseOptions(error.question.options)"
              :key="index"
              :class="{
                'correct-option': isCorrectOption(error.question.answer, index),
                'user-option': isUserOption(error.userAnswer, index)
              }"
            >
              {{ option }}
            </p>
          </div>
        </div>

        <div class="answer-section">
          <p><strong>你的答案:</strong> {{ formatUserAnswer(error) }}</p>
          <p><strong>正确答案:</strong> {{ formatCorrectAnswer(error.question) }}</p>
          <p><strong>来源:</strong> {{ error.source }} - {{ formatTime(error.errorTime) }}</p>
        </div>

        <div class="note-section">
          <el-input
            v-model="error.note"
            type="textarea"
            :rows="2"
            placeholder="添加笔记..."
            @blur="saveNote(error.question.id, error.note)"
          />
        </div>
      </el-card>
    </div>

    <!-- 练习试卷对话框 -->
    <el-dialog title="错题练习" :visible.sync="practiceDialogVisible" width="70%" :before-close="handlePracticeClose">
      <div v-if="practiceDialogVisible" class="practice-paper">
        <el-form ref="practiceForm" label-position="top">
          <div
            v-for="(q, index) in practicePaper.questions"
            :key="q.id"
            class="question-item"
          >
            <el-form-item
              :label="`${index + 1}. ${q.content}`"
            >
              <!-- 单选题 -->
              <el-radio-group
                v-if="q.type === 'single'"
                v-model="practiceAnswers[index].answer"
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
                v-model="practiceAnswers[index].selectedIndices"
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
                v-model="practiceAnswers[index].answer"
              >
                <el-radio label="true">正确</el-radio>
                <el-radio label="false">错误</el-radio>
              </el-radio-group>

              <!-- 简答题 -->
              <el-input
                v-else
                v-model="practiceAnswers[index].answer"
                type="textarea"
                :rows="3"
                placeholder="请输入答案"
              />
            </el-form-item>
          </div>
        </el-form>

        <div class="submit-button">
          <el-button type="primary" :loading="submittingPractice" @click="handlePracticeSubmit">
            提交练习
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getErrorBook,
  getErrorBookBySubject,
  removeFromErrorBook,
  addErrorNote,
  generatePracticePaper
} from '@/api/errorBook'
import { mapGetters } from 'vuex'

export default {
  name: 'ErrorBook',
  data() {
    return {
      errorQuestions: [],
      selectedSubject: '',
      subjects: [],
      practiceDialogVisible: false,
      practicePaper: {
        questions: []
      },
      practiceAnswers: [],
      submittingPractice: false
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  created() {
    this.fetchErrorBook()
  },
  methods: {
    // 格式化用户答案显示
    formatUserAnswer(error) {
      if (!error.userAnswer) return '未作答'

      const options = this.parseOptions(error.question.options)

      // 多选题处理
      if (error.question.type === 'multiple') {
        const indices = error.userAnswer.split(',')
        return indices.map(idx => {
          const optIdx = parseInt(idx)
          return options[optIdx] || `选项${String.fromCharCode(65 + optIdx)}`
        }).join('，')
      }

      // 单选题处理
      if (error.question.type === 'single') {
        const optIdx = parseInt(error.userAnswer)
        return options[optIdx] || `选项${String.fromCharCode(65 + optIdx)}`
      }

      // 判断题处理
      if (error.question.type === 'judge') {
        return error.userAnswer === 'true' ? '正确' : '错误'
      }

      // 简答题直接返回
      return error.userAnswer
    },
    async fetchErrorBook() {
      try {
        const { data } = await getErrorBook(this.userId)
        this.errorQuestions = data
        this.extractSubjects()
      } catch (error) {
        this.$message.error('获取错题本失败')
      }
    },

    async filterBySubject(subject) {
      if (!subject) {
        this.fetchErrorBook()
        return
      }

      try {
        const { data } = await getErrorBookBySubject(this.userId, subject)
        this.errorQuestions = data
      } catch (error) {
        this.$message.error('按科目筛选失败')
      }
    },

    async removeFromErrorBook(questionId) {
      try {
        await removeFromErrorBook(questionId, this.userId)
        this.$message.success('已标记为已掌握')
        this.fetchErrorBook()
      } catch (error) {
        this.$message.error('操作失败')
      }
    },

    async saveNote(questionId, note) {
      try {
        await addErrorNote(questionId, this.userId, note)
        this.$message.success('笔记保存成功')
      } catch (error) {
        this.$message.error('保存笔记失败')
      }
    },
    // 格式化正确答案显示
    formatCorrectAnswer(question) {
      if (!question.answer) return '无'

      const options = this.parseOptions(question.options)

      // 多选题处理
      if (question.type === 'multiple') {
        const indices = question.answer.split(',')
        return indices.map(idx => {
          const optIdx = parseInt(idx)
          return options[optIdx] || `选项${String.fromCharCode(65 + optIdx)}`
        }).join('，')
      }

      // 单选题处理
      if (question.type === 'single') {
        const optIdx = parseInt(question.answer)
        return options[optIdx] || `选项${String.fromCharCode(65 + optIdx)}`
      }

      // 判断题处理
      if (question.type === 'judge') {
        return question.answer === 'true' ? '正确' : '错误'
      }

      // 简答题直接返回
      return question.answer
    },

    async generatePracticePaper() {
      try {
        const { data } = await generatePracticePaper(this.userId, 10)
        this.practicePaper = data

        // 初始化答案结构
        this.practiceAnswers = data.questions.map(question => {
          const answerObj = {
            questionId: question.id,
            type: question.type,
            answer: '', // 初始答案（存储索引）
            correctAnswer: question.answer // 保存正确答案（索引）
          }

          // 多选题需要额外的数组存储选中的索引
          if (question.type === 'multiple') {
            answerObj.selectedIndices = [] // 存储索引数组
          }

          return answerObj
        })

        this.practiceDialogVisible = true
      } catch (error) {
        this.$message.error('生成练习试卷失败')
      }
    },

    // 处理练习关闭
    handlePracticeClose(done) {
      if (this.submittingPractice) return

      this.$confirm('确定要关闭练习吗？未提交的答案将丢失', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        done()
        this.resetPractice()
      }).catch(() => {})
    },

    // 重置练习状态
    resetPractice() {
      this.practicePaper = { questions: [] }
      this.practiceAnswers = []
      this.submittingPractice = false
    },

    // 提交练习
    async handlePracticeSubmit() {
      this.submittingPractice = true

      try {
        // 验证所有题目是否完成
        const incomplete = this.practiceAnswers.some(answer => {
          if (answer.type === 'multiple') {
            return !answer.answer || answer.answer === ''
          }
          return !answer.answer
        })

        if (incomplete) {
          this.$message.warning('请完成所有题目后再提交')
          return
        }

        // 计算正确率
        let correctCount = 0
        const results = this.practiceAnswers.map(item => {
          let isCorrect = false

          // 多选题比较
          if (item.type === 'multiple') {
            // 将用户答案和正确答案都转为排序后的字符串比较
            const userAns = item.answer.split(',').sort().join(',')
            const correctAns = item.correctAnswer.split(',').sort().join(',')
            isCorrect = userAns === correctAns
          } else {
            // 其他题型直接比较与正确答案是否一致
            isCorrect = item.answer === item.correctAnswer
          }

          if (isCorrect) correctCount++

          return {
            questionId: item.questionId,
            userAnswer: item.answer,
            isCorrect
          }
        })

        const correctRate = Math.round((correctCount / this.practiceAnswers.length) * 100)

        this.$message.success(`练习提交成功！正确率: ${correctRate}%`)

        // 标记做对的题目为已掌握
        await Promise.all(results
          .filter(result => result.isCorrect)
          .map(result => removeFromErrorBook(result.questionId, this.userId))
        )

        // 刷新错题本
        this.fetchErrorBook()
        this.practiceDialogVisible = false
      } catch (error) {
        console.error('练习提交失败:', error)
        this.$message.error('练习提交失败')
      } finally {
        this.submittingPractice = false
      }
    },

    extractSubjects() {
      const subjects = new Set()
      this.errorQuestions.forEach(error => {
        subjects.add(error.question.subject)
      })
      this.subjects = Array.from(subjects)
    },

    parseOptions(options) {
      if (!options) return []

      // 如果是竖线分隔的选项
      if (typeof options === 'string' && options.includes('|')) {
        return options.split('|')
      }

      // 尝试解析为JSON数组
      try {
        return JSON.parse(options)
      } catch (e) {
        return []
      }
    },

    // 更新多选题答案
    updateMultipleAnswer(index) {
      // 将选中的索引数组转换为字符串存储
      this.practiceAnswers[index].answer =
        this.practiceAnswers[index].selectedIndices.join(',')
    },

    isCorrectOption(answer, index) {
      return answer && answer.split(',').includes(index.toString())
    },

    isUserOption(userAnswer, index) {
      return userAnswer && userAnswer.split(',').includes(index.toString())
    },

    formatTime(time) {
      return new Date(time).toLocaleString()
    }
  }
}
</script>

<style scoped>
.error-book-container {
  padding: 20px;
}

.practice-paper {
  padding: 20px;
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

.submit-button {
  text-align: center;
  margin-top: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 10px;
}

.error-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.error-card {
  margin-bottom: 20px;
}

.question-subject {
  font-weight: bold;
  margin-right: 10px;
  color: #409EFF;
}

.question-type {
  color: #67C23A;
}

.question-content {
  margin-bottom: 15px;
}

.question-options p {
  margin: 5px 0;
  padding: 5px;
}

.correct-option {
  background-color: #f0f9eb;
  border-left: 3px solid #67C23A;
}

.user-option {
  background-color: #fef0f0;
  border-left: 3px solid #F56C6C;
}

.answer-section {
  margin: 15px 0;
  color: #606266;
}

.note-section {
  margin-top: 15px;
}
</style>
