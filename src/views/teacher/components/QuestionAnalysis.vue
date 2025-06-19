<template>
  <div ref="chart" style="width: 100%; height: 400px;"></div>
</template>

<script>
import * as echarts from 'echarts'
import { debounce } from 'lodash'

export default {
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({})
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
    }
  },
  methods: {
    initChart() {
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
      if (!this.chart || !this.data || Object.keys(this.data).length === 0) return

      const data = Object.entries(this.data).map(([id, score]) => ({
        name: `题目 ${id}`,
        value: score
      }))

      const option = {
        title: {
          text: '题目正确率分析',
          left: 'center',
          top: 20
        },
        tooltip: {
          trigger: 'item',
          formatter: params => {
            return `${params.name}<br/>正确率: ${params.value}%`
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle',
          data: data.map(item => item.name)
        },
        series: [
          {
            name: '题目正确率',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {c}%'
            },
            labelLine: {
              show: true
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            data: data
          }
        ]
      }

      this.chart.setOption(option)
    },

    handleResize: debounce(function() {
      this.chart && this.chart.resize()
    }, 300)
  }
}
</script>
