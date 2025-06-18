<!-- views/teacher/exam/Create.vue -->
<template>
  <div class="exam-create">
    <el-card>
      <div slot="header">
        <span>创建新考试</span>
      </div>

      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="考试名称" prop="title">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="科目" prop="subject">
          <el-input v-model="form.subject"></el-input>
        </el-form-item>
        <el-form-item label="考试描述" prop="description">
          <el-input type="textarea" v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="考试时长(分钟)" prop="duration">
          <el-input-number v-model="form.duration" :min="1"></el-input-number>
        </el-form-item>

        <el-divider>考试题目</el-divider>

        <div v-for="(question, index) in form.questions" :key="index" class="question-item">
          <el-form-item
            :label="`题目 ${index + 1}`"
            :prop="`questions.${index}.content`"
            :rules="{ required: true, message: '请输入题目内容', trigger: 'blur' }"
          >
            <el-input v-model="question.content" type="textarea"></el-input>
          </el-form-item>

          <el-form-item label="题目类型" prop="type">
            <el-radio-group v-model="question.type">
              <el-radio label="SINGLE_CHOICE">单选题</el-radio>
              <el-radio label="MULTIPLE_CHOICE">多选题</el-radio>
              <el-radio label="TRUE_FALSE">判断题</el-radio>
              <el-radio label="SHORT_ANSWER">简答题</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            v-if="question.type !== 'SHORT_ANSWER' && question.type !== 'TRUE_FALSE'"
            label="选项"
            :prop="`questions.${index}.options`"
            :rules="{ required: true, message: '请输入选项', trigger: 'blur' }"
          >
            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
              <el-input v-model="question.options[optIndex]" style="width: 80%">
                <template slot="prepend">{{ String.fromCharCode(65 + optIndex) }}</template>
              </el-input>
              <el-button
                v-if="question.options.length > 2"
                type="danger"
                icon="el-icon-delete"
                circle
                @click="removeOption(index, optIndex)"
              ></el-button>
            </div>
            <el-button @click="addOption(index)">添加选项</el-button>
          </el-form-item>

          <el-form-item
            v-if="question.type !== 'SHORT_ANSWER'"
            label="正确答案"
            :prop="`questions.${index}.answer`"
            :rules="{ required: true, message: '请设置正确答案', trigger: 'blur' }"
          >
            <template v-if="question.type === 'TRUE_FALSE'">
              <el-radio-group v-model="question.answer">
                <el-radio label="TRUE">正确</el-radio>
                <el-radio label="FALSE">错误</el-radio>
              </el-radio-group>
            </template>
            <template v-else>
              <el-checkbox-group v-model="question.answer">
                <el-checkbox
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  :label="String.fromCharCode(65 + optIndex)"
                ></el-checkbox>
              </el-checkbox-group>
            </template>
          </el-form-item>

          <el-form-item label="分值" prop="score">
            <el-input-number v-model="question.score" :min="1"></el-input-number>
          </el-form-item>

          <el-button
            type="danger"
            icon="el-icon-delete"
            @click="removeQuestion(index)"
          >删除题目</el-button>
        </div>

        <el-button type="primary" @click="addQuestion">添加题目</el-button>

        <el-form-item style="margin-top: 20px">
          <el-button type="primary" @click="submitForm">创建考试</el-button>
          <el-button @click="$router.go(-1)">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { createExam } from '@/api/exam'

export default {
  data() {
    return {
      form: {
        title: '',
        subject: '',
        description: '',
        startTime: '',
        endTime: '',
        duration: 60,
        questions: [
          {
            content: '',
            type: 'SINGLE_CHOICE',
            options: ['', ''],
            answer: [],
            score: 1
          }
        ]
      },
      rules: {
        title: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
        subject: [{ required: true, message: '请输入科目', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        duration: [{ required: true, message: '请输入考试时长', trigger: 'blur' }]
      }
    }
  },
  methods: {
    addQuestion() {
      this.form.questions.push({
        content: '',
        type: 'SINGLE_CHOICE',
        options: ['', ''],
        answer: [],
        score: 1
      })
    },
    removeQuestion(index) {
      if (this.form.questions.length > 1) {
        this.form.questions.splice(index, 1)
      } else {
        this.$message.warning('至少需要保留一道题目')
      }
    },
    addOption(questionIndex) {
      this.form.questions[questionIndex].options.push('')
    },
    removeOption(questionIndex, optionIndex) {
      this.form.questions[questionIndex].options.splice(optionIndex, 1)
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            // 处理答案格式
            const questions = this.form.questions.map(q => {
              const answer = q.type === 'SINGLE_CHOICE' || q.type === 'TRUE_FALSE'
                ? q.answer[0]
                : q.answer.join(',')
              return {
                ...q,
                answer
              }
            })

            const payload = {
              ...this.form,
              questions,
              teacherId: this.$store.state.user.id
            }

            await createExam(payload)
            this.$message.success('考试创建成功')
            this.$router.push('/teacher/exams')
          } catch (error) {
            this.$message.error('考试创建失败')
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.question-item {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.option-item .el-button {
  margin-left: 10px;
}
</style>
