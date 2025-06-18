<!-- views/teacher/homework/Results.vue -->
<!-- views/teacher/homework/Results.vue -->
<template>
  <div class="homework-results">
    <el-card>
      <div slot="header">
        <span>{{ homework.title }} - 成绩统计</span>
        <el-button
          style="float: right; margin-left: 10px"
          type="primary"
          @click="exportResults"
        >导出成绩</el-button>
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
            <div slot="header">完成率</div>
            <div class="stat-value">{{ (results.completionRate * 100).toFixed(1) }}%</div>
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
          <el-table-column label="状态">
            <template slot-scope="{row}">
              <el-tag :type="getStatusTagType(row.status)">
                {{ formatStatus(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="百分比">
            <template slot-scope="{row}">
              {{ ((row.score / row.totalScore) * 100).toFixed(1) }}%
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="{row}">
              <el-button
                v-if="hasSubjectiveQuestions"
                size="mini"
                type="primary"
                @click="gradeHomework(row.studentId)"
              >批改</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script>
import { getHomeworkResults, export
