<template>
  <div class="app-container">
    <el-card shadow="hover" class="profile-card">
      <!-- 头部标题 -->
      <div slot="header" class="clearfix">
        <span>个人中心</span>
      </div>

      <div class="profile-container">
        <!-- 左侧头像区域 -->
        <div class="avatar-section">
          <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleAvatarChange"
            accept="image/*"
          >
            <img v-if="profile.avatarUrl" :src="getFullAvatarUrl(profile.avatarUrl)" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="upload-tip">点击更换头像</div>
          </el-upload>

          <div class="user-info">
            <h3>{{ profile.fullName || profile.username }}</h3>
            <el-tag :type="roleTagType">{{ roleText }}</el-tag>
          </div>
        </div>

        <!-- 右侧内容区域 -->
        <div class="content-section">
          <el-tabs v-model="activeTab">
            <!-- 基本信息标签页 -->
            <el-tab-pane label="基本信息" name="basic">
              <profile-basic
                :profile="profile"
                @submit="handleUpdateProfile"
              />
            </el-tab-pane>

            <!-- 密码修改标签页 -->
            <el-tab-pane label="修改密码" name="password">
              <profile-password @submit="handleChangePassword" />
            </el-tab-pane>

            <!-- 学习统计标签页 -->
            <el-tab-pane label="学习统计" name="statistics">
              <profile-statistics :statistics="statistics" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getProfile, updateProfile, changePassword, getLearningStatistics, uploadAvatar } from '@/api/profile'
import ProfileBasic from './components/ProfileBasic'
import ProfilePassword from './components/ProfilePassword'
import ProfileStatistics from './components/ProfileStatistics'

export default {
  name: 'Profile',
  components: {
    ProfileBasic,
    ProfilePassword,
    ProfileStatistics
  },
  data() {
    return {
      activeTab: 'basic',
      profile: {
        userId: null,
        username: '',
        fullName: '',
        email: '',
        phone: '',
        role: '',
        avatarUrl: ''
      },
      statistics: {
        totalExams: 0,
        totalHomeworks: 0,
        avgExamScore: 0,
        avgHomeworkScore: 0,
        errorCount: 0
      },
      avatarFile: null,
      loading: false
    }
  },
  computed: {
    roleText() {
      const roles = {
        'STUDENT': '学生',
        'TEACHER': '教师',
        'ADMIN': '管理员'
      }
      return roles[this.profile.role] || this.profile.role
    },
    roleTagType() {
      const types = {
        'STUDENT': 'success',
        'TEACHER': 'warning',
        'ADMIN': 'danger'
      }
      return types[this.profile.role] || 'info'
    },
    userId() {
      return this.$route.query.studentId || this.$store.state.user.userId
    }
  },
  created() {
    this.fetchProfile()
    this.fetchStatistics()
  },
  methods: {
    getFullAvatarUrl(url) {
      if (!url) return '';

      // 已经是完整URL或base64数据
      if (url.startsWith('http') || url.startsWith('data:')) return url;

      // 处理头像路径
      const baseUrl = process.env.VUE_APP_BASE_API || window.location.origin;
      return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    },
    async fetchProfile() {
      try {
        this.loading = true
        const { data } = await getProfile(this.userId)
        this.profile = data
      } catch (error) {
        console.error('获取个人信息失败:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchStatistics() {
      try {
        const { data } = await getLearningStatistics(this.userId)
        this.statistics = data
      } catch (error) {
        console.error('获取学习统计失败:', error)
      }
    },

    async handleUpdateProfile(form) {
      try {
        this.loading = true
        const { data } = await updateProfile(form)
        this.profile = data
        this.$message.success('个人信息更新成功')

        // 如果有新头像要上传
        if (this.avatarFile) {
          await this.uploadAvatar()
        }
      } catch (error) {
        console.error('更新失败:', error)
      } finally {
        this.loading = false
      }
    },

    async handleChangePassword(form) {
      try {
        this.loading = true
        const requestData = {
          userId: this.$store.state.user.userId,
          oldPassword: form.oldPassword,
          newPassword: form.newPassword
        }
        await changePassword(requestData)
        this.$message.success('密码修改成功')
        this.activeTab = 'basic'
      } catch (error) {
        console.error('密码修改失败:', error)
      } finally {
        this.loading = false
      }
    },

    handleAvatarChange(file) {
      const rawFile = file.raw
      this.uploadAvatar(rawFile)
    },

    async uploadAvatar(file) {
      try {
        const { data } = await uploadAvatar(file, this.userId) // 确保传userId
        this.profile.avatarUrl = data
        this.$store.commit('user/SET_AVATAR', data) // 更新Vuex
        this.$message.success('头像上传成功')
      } catch (error) {
        console.error('头像上传失败:', error)
        this.$message.error('头像上传失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.profile-card {
  min-height: calc(100vh - 120px);
}

.profile-container {
  display: flex;
  padding: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.avatar-section {
  width: 250px;
  padding-right: 30px;
  text-align: center;

  @media (max-width: 768px) {
    width: 100%;
    padding-right: 0;
    margin-bottom: 20px;
  }
}

.content-section {
  flex: 1;
}

.avatar-uploader {
  margin-bottom: 20px;

  ::v-deep .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 150px;
    height: 150px;
    display: block;
    margin: 0 auto 10px;

    &:hover {
      border-color: #409EFF;
    }
  }

  .avatar {
    width: 150px;
    height: 150px;
    display: block;
    object-fit: cover;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 150px;
    height: 150px;
    line-height: 150px;
    text-align: center;
  }
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 20px;
}

.user-info {
  h3 {
    margin: 0 0 10px;
    font-size: 18px;
  }

  .el-tag {
    margin-right: 0;
  }
}

 .avatar-container {
   width: 100px;
   height: 100px;
   border-radius: 50%;
   overflow: hidden;
 }

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
