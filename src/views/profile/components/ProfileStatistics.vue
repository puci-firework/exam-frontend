<template>
  <div class="statistics-container">
    <el-row :gutter="20">
      <el-col :span="12" class="stat-item">
        <div class="stat-card">
          <div class="stat-title">考试总数</div>
          <div class="stat-value">{{ statistics.totalExams }}</div>
        </div>
      </el-col>
      <el-col :span="12" class="stat-item">
        <div class="stat-card">
          <div class="stat-title">作业总数</div>
          <div class="stat-value">{{ statistics.totalHomeworks }}</div>
        </div>
      </el-col>
      <el-col :span="12" class="stat-item">
        <div class="stat-card">
          <div class="stat-title">考试平均分</div>
          <div class="stat-value">{{ statistics.avgExamScore.toFixed(1) }}</div>
        </div>
      </el-col>
      <el-col :span="12" class="stat-item">
        <div class="stat-card">
          <div class="stat-title">作业平均分</div>
          <div class="stat-value">{{ statistics.avgHomeworkScore.toFixed(1) }}</div>
        </div>
      </el-col>
      <el-col :span="24" class="stat-item">
        <div class="stat-card">
          <div class="stat-title">错题总数</div>
          <div class="stat-value">{{ statistics.errorCount }}</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'ProfileStatistics',
  props: {
    statistics: {
      type: Object,
      required: true,
      default: () => ({
        totalExams: 0,
        totalHomeworks: 0,
        avgExamScore: 0,
        avgHomeworkScore: 0,
        errorCount: 0
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.statistics-container {
  padding: 10px;
}

.stat-item {
  margin-bottom: 20px;
}

.stat-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  background-color: #f5f7fa;
  height: 100%;

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
}
</style>
