import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

// 白名单（无需登录可访问的路径）
const whiteList = ['/login', '/register', '/404']

router.beforeEach(async(to, from, next) => {
  // 启动进度条
  NProgress.start()

  // 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 获取用户token
  const hasToken = getToken()

  /* 已登录状态 */
  if (hasToken) {
    // 如果访问的是登录页或注册页，重定向到首页
    if (to.path === '/login' || to.path === '/register') {
      next({ path: '/' })
      NProgress.done()
      // eslint-disable-next-line brace-style
    }
    // 访问正常路由
    else {
      // 检查用户信息是否已获取（根据实际需求开启）
      // const hasGetUserInfo = store.getters.name
      // if (hasGetUserInfo) {
      //   next()
      // } else {
      //   try {
      //     await store.dispatch('user/getInfo')
      //     next()
      //   } catch (error) {
      //     await store.dispatch('user/resetToken')
      //     Message.error(error || '获取用户信息失败')
      //     next(`/login?redirect=${to.path}`)
      //     NProgress.done()
      //   }
      // }
      next()
    }
    // eslint-disable-next-line brace-style
  }
  /* 未登录状态 */
  else {
    // 在白名单中的路径直接放行
    if (whiteList.includes(to.path)) {
      next()
      // eslint-disable-next-line brace-style
    }
    // 其他需要权限的路径重定向到登录页
    else {
      // 将目标路径作为redirect参数传递，登录后跳转
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // 完成进度条
  NProgress.done()
})
