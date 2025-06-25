<template>
  <div class="top-nav">
    <div class="logo" @click="goToDashboard">作业考试系统</div>

    <el-menu
      :active-text-color="variables.menuActiveText"
      :default-active="activeMenu"
      mode="horizontal"
      @select="handleSelect"
    >
      <!-- 首页菜单项 - 所有角色都显示 -->
      <el-menu-item index="/dashboard" @click="goToDashboard">首页</el-menu-item>

      <!-- 管理员只显示首页和用户管理 -->
      <template v-if="!isAdmin">
        <!-- 通用功能 -->
        <!-- 动态显示考试菜单项 -->
        <el-menu-item
          index="/exam/list"
          @click="goToExamList">
          {{ isTeacher ? '我的考试' : '所有考试' }}
        </el-menu-item>

        <!-- 统一作业菜单项 -->
        <el-menu-item
          index="/homework/list"
          @click="goToHomeworkList">
          {{ isTeacher ? '我的作业' : '所有作业' }}
        </el-menu-item>

        <!-- 成绩查询 - 学生显示，教师不显示 -->
        <el-menu-item v-if="!isTeacher" index="/score/list" @click="goToScoreList">成绩查询</el-menu-item>

        <!-- 错题本 - 学生显示 -->
        <el-menu-item v-if="!isTeacher" index="/error-book/list" @click="goToErrorBook">错题本</el-menu-item>

        <!-- 教师专属功能 -->
        <el-submenu v-if="isTeacher" index="teacher-actions">
          <template #title>教师操作</template>
          <el-menu-item index="/exam/create" @click="goToCreateExam">创建考试</el-menu-item>
          <el-menu-item index="/homework/create" @click="goToCreateHomework">布置作业</el-menu-item>
          <el-menu-item index="/teacher/dashboard" @click="goToTeacherDashboard">教师中心</el-menu-item>
        </el-submenu>
      </template>

      <!-- 管理员专属功能 -->
      <el-menu-item v-if="isAdmin" index="/admin/users" @click="goToUserManagement">用户管理</el-menu-item>
    </el-menu>

    <!-- 右侧用户头像下拉菜单 -->
    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="getFullAvatarUrl(avatar)+'?t='+timestamp" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block; color: #F56C6C;">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import variables from '@/styles/variables.scss'
import { mapGetters } from 'vuex'

export default {
  name: 'Topbar',
  data() {
    return {
      variables: variables,
      timestamp: Date.now()
    }
  },
  computed: {
    ...mapGetters(['avatar', 'sidebar']),
    isTeacher() {
      return this.$store.state.user.role === 'TEACHER'
    },
    isAdmin() {
      return this.$store.state.user.role === 'ADMIN'
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      // 高亮一级菜单
      return '/' + path.split('/')[1]
    }
  },
  watch: {
    '$store.state.user.avatar'(newVal) {
      this.timestamp = Date.now() // 头像更新时强制刷新
    }
  },
  methods: {
    getFullAvatarUrl(url) {
      if (!url) return require('@/assets/default_avatar.png')

      // 已经是完整URL或base64数据
      if (url.startsWith('http') || url.startsWith('data:')) return url

      // 处理头像路径
      const baseUrl = process.env.VUE_APP_BASE_API || window.location.origin
      return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
    },
    // 导航方法
    goToDashboard() {
      this.$router.push('/dashboard').catch(err => {
        console.error('导航失败:', err)
      })
    },
    goToTeacherDashboard() {
      this.$router.push('/teacher/dashboard')
    },
    goToExamList() {
      this.$router.push('/exam/list')
    },
    goToHomeworkList() {
      this.$router.push('/homework/list')
    },
    goToScoreList() {
      this.$router.push('/score/list')
    },
    goToErrorBook() {
      this.$router.push('/error-book/list')
    },
    goToCreateExam() {
      this.$router.push('/teacher/exams')
    },
    goToCreateHomework() {
      this.$router.push('/teacher/homeworks')
    },
    goToUserManagement() {
      this.$router.push('/admin/users')
    },
    async logout() {
      try {
        await this.$store.dispatch('user/logout')
        this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      } catch (error) {
        console.error('登出失败:', error)
        this.$router.push('/login')
      }
    },
    handleSelect(key) {
      // 可扩展的菜单选中逻辑
      console.log('菜单选中:', key)
    }
  }
}
</script>

<style lang="scss" scoped>
.top-nav {
  display: flex;
  align-items: center;
  height: 50px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
  position: relative;
  z-index: 100;

  .logo {
    font-size: 18px;
    font-weight: bold;
    margin-right: 30px;
    color: #409EFF;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }

  .el-menu {
    flex: 1;
    border-bottom: none;
    background: transparent;

    &--horizontal {
      display: flex;
      align-items: center;
    }

    .el-menu-item, .el-submenu__title {
      height: 50px;
      line-height: 50px;
      margin: 0 5px;
      &:hover {
        background-color: rgba(64, 158, 255, 0.1) !important;
      }
    }
  }

  .right-menu {
    margin-left: auto;
    display: flex;
    align-items: center;

    .avatar-container {
      cursor: pointer;
      padding: 0 10px;

      .avatar-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #eee;
          transition: all 0.3s;
          &:hover {
            transform: scale(1.1);
          }
        }

        .el-icon-caret-bottom {
          margin-left: 5px;
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .badge {
      margin-left: 5px;
      ::v-deep .el-badge__content {
        top: 5px;
      }
    }
  }

  .user-dropdown {
    .el-dropdown-menu__item {
      line-height: 36px;
      padding: 0 20px;
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

@media (max-width: 992px) {
  .top-nav {
    padding: 0 10px;
    .logo {
      margin-right: 15px;
      font-size: 16px;
    }
    .el-menu-item {
      padding: 0 8px !important;
      font-size: 13px;
    }
  }
}
</style>
