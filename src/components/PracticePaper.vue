<!-- src/components/PracticePaper.vue -->
<template>
  <div class="practice-paper">
    <div v-for="(question, index) in questions" :key="question.id" class="question-item">
      <h3>第 {{ index + 1 }} 题 ({{ question.subject }})</h3>
      <div v-html="question.content"></div>

      <div v-if="question.options" class="options">
        <el-radio-group v-model="userAnswers[index]">
          <el-radio
            v-for="(option, optIndex) in parseOptions(question.options)"
            :key="optIndex"
            :label="String.fromCharCode(65 + optIndex)"
          >
            {{ option }}
          </el-radio>
        </el-radio-group>
      </div>

      <el-input
        v-else
        v-model="userAnswers[index]"
        placeholder="请输入答案"
      ></el-input>
    </div>

    <div class="submit-area">
      <el-button type="primary" size="large" @click="submitAnswers">提交试卷</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PracticePaper',
  props: {
    questions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      userAnswers: Array(this.questions.length).fill('')
    }
  },
  methods: {
    parseOptions(options) {
      try {
        return options.split('|')
      } catch {
        return []
      }
    },

    submitAnswers() {
      let correctCount = 0

      this.questions.forEach((question, index) => {
        if (this.userAnswers[index] === question.answer) {
          correctCount++
        }
      })

      const correctRate = Math.round((correctCount / this.questions.length) * 100)

      this.$emit('submit', {
        correctCount,
        totalCount: this.questions.length,
        correctRate
      })
    }
  }
}
</script>

<style scoped>
.practice-paper {
  padding: 20px;
}

.question-item {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.options {
  margin-top: 15px;
}

.el-radio {
  display: block;
  margin: 10px 0;
}

.submit-area {
  text-align: center;
  margin-top: 30px;
}
</style>
