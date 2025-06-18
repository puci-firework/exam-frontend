<!-- views/teacher/exam/Results.vue -->
<template>
  <div class="exam-results">
    <el-card>
      <div slot="header">
        <span>{{ exam.title }} - 成绩统计</span>
        <el-button
          style="float: right; margin-left: 10px"
          type="primary"
          @click="exportResults"
        >导出成绩</el-button>
        <el-button
          style="float: right"
          type="success"
          @click="publishResults"
          v-if="!exam.published"
        >发布成绩</el-button>
      </div>

      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header">平均分</div>
            <div class="stat-value">{{ results.avgScore.toFixed(1) }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header">及格率</div>
            <div class="stat-value">{{ (results.passRate * 100).toFixed(1) }}%</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header">最高分</div>
            <div class="stat-value">{{ results.maxScore }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header">最低分</div>
            <div class="stat-value">{{ results.minScore }}</div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card>
            <div slot="header">分数分布</div>
            <div style="height: 300px">
              <bar-chart :chart-data="scoreDistributionData"></bar-chart>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <div slot="header">题目平均分</div>
            <div style="height: 300px">
              <bar-chart :chart-data="questionAvgData"></bar-chart>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card style="margin-top: 20px">
        <div slot="header">学生成绩列表</div>
        <el-table :data="results.studentScores" style="width: 100%">
          <el-table-column prop="studentName" label="学生姓名"></el-table-column>
          <el-table-column prop="score" label="得分"></el-table-column>
          <el-table-column prop="totalScore" label="总分"></el-table-column>
          <el-table-column label="百分比">
            <template slot-scope="{row}">
              {{ ((row.score / row.totalScore) * 100).toFixed(1) }}%
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script>
import { getExamResults, exportExamResults, publishExamResults } from '@/api/exam'
import BarChart from '@/components/Charts/BarChart'

export default {
  components: { BarChart },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      exam: {},
      results: {
        avgScore: 0,
        passRate: 0,
        maxScore: 0,
        minScore: 0,
        studentScores: []
      }
    }
  },
  computed: {
    scoreDistributionData() {
      const distribution = this.results.scoreDistribution || {}
      return {
        labels: ['0-59', '60-69', '70-79', '80-89', '90-100'],
        datasets: [{
          label: '人数',
          backgroundColor: '#409EFF',
          data: [
            distribution['0-59'] || 0,
            distribution['60-69'] || 0,
            distribution['70-79'] || 0,
            distribution['80-89'] || 0,
            distribution['90-100'] || 0
          ]
        }]
      }
    },
    questionAvgData() {
      const questionAvgs = this.results.questionAvgScores || {}
      const questions = this.exam.questions || []
      return {
        labels: questions.map((q, i) => `Q${i + 1}`),
        datasets: [{
          label: '平均分',
          backgroundColor: '#67C23A',
          data: questions.map(q => questionAvgs[q.id] || 0)
        }]
      }
    }
  },
  async created() {
    await this.fetchResults()
  },
  methods: {
    async fetchResults() {
      try {
        const { data } = await getExamResults(this.id)
        this.exam = data.exam
        this.results = data
      } catch (error) {
        this.$message.error('获取考试结果失败')
      }
    },
    async exportResults() {
      try {
        const response = await exportExamResults(this.id, { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `exam_results_${this.id}.xlsx`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        this.$message.error('导出失败')
      }
    },
    async publishResults() {
      try {
        await publishExamResults(this.id)
        this.$message.success('成绩发布成功')
        this.fetchResults()
      } catch (error) {
        this.$message.error('成绩发布失败')
      }
    }
  }
}
</script>

<style scoped>
.stat-value {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}
</style>
