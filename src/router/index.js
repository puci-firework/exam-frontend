import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */

/* 公共路由（无需权限） */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: {
        title: '首页',
        icon: 'dashboard',
        affix: true // 固定标签页
      }
    }]
  }
]

/* 动态路由（需权限控制） */
export const asyncRoutes = [
  /* 考试管理 */
  {
    path: '/exam',
    component: Layout,
    redirect: '/exam/list',
    name: 'Exam',
    meta: {
      title: '考试管理',
      icon: 'el-icon-s-help',
      roles: ['TEACHER', 'ADMIN', 'STUDENT'] // 改为大写
    },
    children: [
      {
        path: 'list',
        name: 'ExamList',
        component: () => import('@/views/exam/list'),
        meta: {
          title: '考试列表',
          keepAlive: true
        }
      },
      {
        path: 'detail/:id',
        name: 'ExamDetail',
        component: () => import('@/views/exam/detail'),
        meta: {
          title: '考试详情信息',
          keepAlive: true
        }
      },
      {
        path: 'do/:id',
        name: 'DoExam',
        component: () => import('@/views/exam/do'),
        meta: {
          title: '参加考试',
          roles: ['STUDENT'], // 改为大写
          activeMenu: '/exam/list'
        },
        hidden: true
      }
    ]
  },

  /* 作业管理 */
  {
    path: '/homework',
    component: Layout,
    redirect: '/homework/list',
    name: 'Homework',
    meta: {
      title: '作业管理',
      icon: 'el-icon-notebook-2',
      roles: ['TEACHER', 'ADMIN', 'STUDENT'] // 改为大写
    },
    children: [
      {
        path: 'list',
        name: 'HomeworkList',
        component: () => import('@/views/homework/list'),
        meta: {
          title: '作业列表',
          keepAlive: true
        }
      },
      {
        path: 'detail/:id',
        name: 'HomeworkDetail',
        component: () => import('@/views/homework/detail'),
        meta: {
          title: '作业详情信息',
          keepAlive: true
        }
      },
      {
        path: 'do/:id',
        name: 'DoHomework',
        component: () => import('@/views/homework/do'),
        meta: {
          title: '做作业',
          roles: ['STUDENT'], // 改为大写
          activeMenu: '/homework/list'
        },
        hidden: true
      }
    ]
  },
  // 成绩
  {
    path: '/score',
    component: Layout,
    redirect: '/score/list',
    name: 'Score',
    meta: {
      title: '成绩管理',
      icon: 'el-icon-data-line',
      roles: ['STUDENT', 'TEACHER', 'ADMIN']
    },
    children: [
      {
        path: 'list',
        name: 'ScoreList',
        component: () => import('@/views/score/ScoreList'),
        meta: {
          title: '成绩列表',
          keepAlive: true
        }
      },
      {
        path: 'exam/:id',
        name: 'ExamScoreDetail',
        component: () => import('@/views/score/ExamScoreDetail'),
        meta: {
          title: '考试详情',
          activeMenu: '/score/list'
        },
        hidden: true
      },
      {
        path: 'homework/:id',
        name: 'HomeworkScoreDetail',
        component: () => import('@/views/score/HomeworkScoreDetail'),
        meta: {
          title: '作业详情',
          activeMenu: '/score/list'
        },
        hidden: true
      }
    ]
  },
  /* 错题本管理 */
  {
    path: '/error-book',
    component: Layout,
    redirect: '/error-book/list',
    name: 'ErrorBook',
    meta: {
      title: '错题本',
      icon: 'el-icon-collection',
      roles: ['STUDENT'] // 通常只有学生需要错题本功能
    },
    children: [
      {
        path: 'list',
        name: 'ErrorBookList',
        component: () => import('@/views/ErrorBook'), // 对应之前创建的ErrorBook.vue
        meta: {
          title: '错题本',
          keepAlive: true
        }
      }
    ]
  },
  // // 教师
  {
    path: '/teacher',
    component: Layout,
    redirect: '/teacher/exams',
    name: 'Teacher',
    meta: {
      title: '教师管理',
      icon: 'el-icon-s-custom',
      roles: ['TEACHER', 'ADMIN']
    },
    children: [
      {
        path: 'exam/create',
        name: 'ExamCreate',
        component: () => import('@/views/teacher/exam/Create.vue'),
        meta: {
          title: '创建考试'
        }
      },
      {
        path: 'homework/create',
        name: 'HomeworkCreate',
        component: () => import('@/views/teacher/HomeworkCreate'),
        meta: {
          title: '布置作业'
        }
      },
      {
        path: 'exam/results/:id',
        name: 'ExamResults',
        component: () => import('@/views/teacher/ExamResults'),
        meta: {
          title: '考试结果',
          activeMenu: '/exam/list'
        },
        hidden: true
      },
      {
        path: 'homework/grade/:id',
        name: 'HomeworkGrade',
        component: () => import('@/views/teacher/HomeworkGrade'),
        meta: {
          title: '批改作业',
          activeMenu: '/homework/list'
        },
        hidden: true
      }
    ]
  },
  // 管理员
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/users',
    name: 'Admin',
    meta: {
      title: '系统管理',
      icon: 'el-icon-s-tools',
      roles: ['ADMIN'] // 只有管理员可以访问
    },
    children: [
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/admin/UserManagement'),
        meta: {
          title: '用户管理',
          icon: 'el-icon-user'
        }
      }
    ]
  },

  // 404路由必须放在最后
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // 需要后端支持
  scrollBehavior: () => ({ y: 0 }),
  routes: [...constantRoutes, ...asyncRoutes] // 合并路由
})

const router = createRouter()

/* 重置路由（用于权限变更时） */
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // 替换路由匹配器
}

export default router
