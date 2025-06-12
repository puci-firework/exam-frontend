const Mock = require('mockjs')

const data = Mock.mock({
  'items|10': [{
    questionID: '@id',
    title: '@sentence(5, 10)',
    'status|1': ['solved', 'pending'],
    // subject: 'name',
    subject: '@pick(["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治"])',
    start_time: '@datetime',
    duration: '@integer(60, 120)',
    // pageviews: '@integer(300, 5000)'
  }]
})

module.exports = [
  {
    url: '/vue-admin-template/table/list',
    type: 'get',
    response: config => {
      const items = data.items
      return {
        code: 20000,
        data: {
          total: items.length,
          items: items
        }
      }
    }
  }
]
