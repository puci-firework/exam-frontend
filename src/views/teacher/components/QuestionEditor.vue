<template>
  <div class="question-editor">
    <el-button type="primary" size="mini" @click="addQuestion">添加题目</el-button>

    <div v-for="(q, index) in questions" :key="index" class="question-item">
      <el-form-item label="题目内容" :prop="`questions[${index}].content`"
                    :rules="{ required: true, message: '请输入题目内容', trigger: 'blur' }">
        <el-input v-model="q.content" type="textarea"></el-input>
      </el-form-item>

      <el-form-item label="题目类型">
        <el-select v-model="q.type" placeholder="请选择题型" @change="handleTypeChange(q)">
          <el-option label="单选题" value="single"></el-option>
          <el-option label="多选题" value="multiple"></el-option>
          <el-option label="判断题" value="judge"></el-option>
          <el-option label="简答题" value="short"></el-option>
        </el-select>
      </el-form-item>

      <!-- 选择题选项 -->
      <template v-if="q.type === 'single' || q.type === 'multiple'">
        <el-form-item
          v-for="(opt, optIndex) in q.options"
          :key="optIndex"
          :label="`选项 ${optIndex+1}`"
          :rules="{ required: true, message: '选项不能为空', trigger: 'blur' }"
        >
          <el-input v-model="q.options[optIndex]">
            <template #append>
              <el-checkbox
                v-if="q.type === 'multiple'"
                v-model="q.answer"
                :label="String(optIndex)"
              >正确答案</el-checkbox>
              <el-radio
                v-if="q.type === 'single'"
                v-model="q.answer"
                :label="String(optIndex)"
              >正确答案</el-radio>
            </template>
          </el-input>
        </el-form-item>
        <el-button size="mini" @click="addOption(q)">添加选项</el-button>
      </template>

      <!-- 判断题答案 -->
      <el-form-item
        v-if="q.type === 'judge'"
        label="正确答案"
        :rules="{ required: true, message: '请选择正确答案', trigger: 'change' }"
      >
        <el-radio-group v-model="q.answer">
          <el-radio :label="true">正确</el-radio>
          <el-radio :label="false">错误</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 简答题答案 -->
      <el-form-item
        v-if="q.type === 'short'"
        label="参考答案"
        :rules="{ required: true, message: '请输入参考答案', trigger: 'blur' }"
      >
        <el-input v-model="q.answer" type="textarea"></el-input>
      </el-form-item>

      <el-form-item label="分值" :rules="{ required: true, message: '请设置分值', trigger: 'blur' }">
        <el-input-number v-model="q.score" :min="1" :max="20"></el-input-number>
      </el-form-item>

      <el-button size="mini" type="danger" @click="removeQuestion(index)">删除题目</el-button>
      <el-divider></el-divider>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionEditor',
  props: {
    questions: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    addQuestion() {
      this.questions.push({
        content: '',
        type: 'single',
        options: ['', ''],
        answer: this.getDefaultAnswer('single'),
        score: 5
      })
      this.$emit('update', this.questions)
    },

    addOption(question) {
      question.options.push('')
      this.$emit('update', this.questions)
    },

    removeQuestion(index) {
      this.questions.splice(index, 1)
      this.$emit('update', this.questions)
    },

    handleTypeChange(question) {
      // 重置答案格式当题型变化时
      question.answer = this.getDefaultAnswer(question.type)

      // 选择题需要初始化选项
      if (question.type === 'single' || question.type === 'multiple') {
        question.options = question.options || ['', '']
      } else {
        question.options = []
      }

      this.$emit('update', this.questions)
    },

    getDefaultAnswer(type) {
      switch (type) {
        case 'single': return ''
        case 'multiple': return []
        case 'judge': return null
        case 'short': return ''
        default: return ''
      }
    }
  }
}
</script>

<style scoped>
.question-item {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>
