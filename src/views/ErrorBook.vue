<!-- src/views/ErrorBook.vue -->
<template>
  <div class="error-book-container">
    <div class="header">
      <h1>我的错题本</h1>
      <div class="actions">
        <el-select v-model="selectedSubject" placeholder="按科目筛选" @change="filterBySubject">
          <el-option label="全部科目" value=""></el-option>
          <el-option
            v-for="subject in subjects"
            :key="subject"
            :label="subject"
            :value="subject"
          ></el-option>
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
          <p v-html="error.question.content"></p>

          <div v-if="error.question.options" class="question-options">
            <p v-for="(option, index) in parseOptions(error.question.options)"
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
          <p><strong>你的答案:</strong> {{ error.userAnswer }}</p>
          <p><strong>正确答案:</strong> {{ error.question.answer }}</p>
          <p><strong>来源:</strong> {{ error.source }} - {{ formatTime(error.errorTime) }}</p>
        </div>

        <div class="note-section">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="添加笔记..."
            v-model="error.note"
            @blur="saveNote(error.question.id, error.note)"
          ></el-input>
        </div>
      </el-card>
    </div>

    <!-- 练习试卷对话框 -->
    <el-dialog title="错题练习" :visible.sync="practiceDialogVisible" width="70%">
      <practice-paper
        v-if="practiceDialogVisible"
        :questions="practicePaper.questions"
        @submit="handlePracticeSubmit"
      ></practice-paper>
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
import PracticePaper from '@/components/PracticePaper.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'ErrorBook',
  components: {
    PracticePaper
  },
  data() {
    return {
      errorQuestions: [],
      selectedSubject: '',
      subjects: [],
      practiceDialogVisible: false,
      practicePaper: {
        questions: []
      }
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  created() {
    this.fetchErrorBook()
  },
  methods: {
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

    async generatePracticePaper() {
      try {
        const { data } = await generatePracticePaper(this.userId, 10)
        this.practicePaper = data
        this.practiceDialogVisible = true
      } catch (error) {
        this.$message.error('生成练习试卷失败')
      }
    },

    handlePracticeSubmit(results) {
      this.practiceDialogVisible = false
      // 这里可以处理练习结果，比如显示得分等
      this.$message.success(`练习完成！正确率: ${results.correctRate}%`)
    },

    extractSubjects() {
      const subjects = new Set()
      this.errorQuestions.forEach(error => {
        subjects.add(error.question.subject)
      })
      this.subjects = Array.from(subjects)
    },

    parseOptions(options) {
      try {
        return options.split('|')
      } catch {
        return []
      }
    },

    isCorrectOption(answer, index) {
      return answer && answer.includes(String.fromCharCode(65 + index))
    },

    isUserOption(userAnswer, index) {
      return userAnswer && userAnswer.includes(String.fromCharCode(65 + index))
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
