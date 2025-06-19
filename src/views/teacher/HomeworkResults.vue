<template>
  <div class="homework-results">
    <el-card>
      <div slot="header">
        <span>作业结果 - {{ homework.title }}</span>
        <div style="float: right">
          <el-button type="primary" size="mini" @click="exportResults">导出成绩</el-button>
        </div>
      </div>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">平均分</div>
            <div class="stat-value">{{ results.avgScore.toFixed(1) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">完成率</div>
            <div class="stat-value">{{ (results.completionRate * 100).toFixed(1) }}%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">最高分</div>
            <div class="stat-value">{{ results.maxScore }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">最低分</div>
            <div class="stat-value">{{ results.minScore }}</div>
          </div>
        </el-col>
      </el-row>

      <el-tabs>
        <el-tab-pane label="成绩分布">
          <score-distribution-chart :data="results.scoreDistribution"/>
        </el-tab-pane>
        <el-tab-pane label="题目分析">
          <question-analysis
            v-if="Object.keys(results.questionAvgScores).length > 0"
            :data="results.questionAvgScores"
          />
          <el-empty v-else description="暂无题目分析数据" />
        </el-tab-pane>
      </el-tabs>

      <el-table :data="results.studentScores" style="width: 100%; margin-top: 20px">
        <el-table-column prop="studentName" label="学生姓名"></el-table-column>
        <el-table-column prop="score" label="得分" width="120"></el-table-column>
        <el-table-column prop="totalScore" label="总分" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="120"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getHomeworkResults, exportHomeworkResults } from '@/api/teacher'
import ScoreDistributionChart from './components/ScoreDistributionChart'
import QuestionAnalysis from './components/QuestionAnalysis'

export default {
  name: 'HomeworkResults',
  components: { ScoreDistributionChart, QuestionAnalysis },
  data() {
    return {
      homeworkId: this.$route.params.homeworkId,
      homework: {},
      results: {
        avgScore: 0,
        completionRate: 0,
        maxScore: 0,
        minScore: 0,
        scoreDistribution: {},
        questionAvgScores: {},
        studentScores: []
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const res = await getHomeworkResults(this.homeworkId)
        this.homework = res.data.homework
        this.results = res.data
      } catch (error) {
        console.error('获取作业结果失败:', error)
      }
    },
    async exportResults() {
      try {
        const res = await exportHomeworkResults(this.homeworkId)
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${this.homework.title}_成绩.xlsx`)
        document.body.appendChild(link)
        link.click()
      } catch (error) {
        console.error('导出失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.stat-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  background-color: #f5f7fa;
}
.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
</style>
