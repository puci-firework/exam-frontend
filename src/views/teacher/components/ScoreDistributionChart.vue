<template>
  <div ref="chart" style="width: 100%; height: 300px;"></div>
</template>

<script>
import * as echarts from 'echarts'
import { debounce } from 'lodash'

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.updateChart()
      }
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    initChart() {
      // 确保DOM已渲染
      this.$nextTick(() => {
        const dom = this.$refs.chart
        if (!dom || dom.clientWidth === 0 || dom.clientHeight === 0) {
          setTimeout(this.initChart, 100)
          return
        }

        this.chart = echarts.init(dom)
        this.updateChart()
      })
    },

    updateChart() {
      if (!this.chart) return

      const option = {
        tooltip: {
          trigger: 'item'
        },
        xAxis: {
          type: 'category',
          data: Object.keys(this.data)
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: Object.values(this.data),
          type: 'bar',
          showBackground: true,
          itemStyle: {
            color: '#409EFF'
          }
        }]
      }

      this.chart.setOption(option)
    },

    handleResize: debounce(function() {
      if (this.chart) {
        this.chart.resize()
      }
    }, 300)
  }
}
</script>
