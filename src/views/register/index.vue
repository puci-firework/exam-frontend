<template>
  <div class="register-container">
    <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form" auto-complete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">用户注册</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="registerForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="registerForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="2"
          auto-complete="on"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="confirmPassword"
          v-model="registerForm.confirmPassword"
          :type="passwordType"
          placeholder="确认密码"
          name="confirmPassword"
          tabindex="3"
          auto-complete="on"
          @keyup.enter.native="handleRegister"
        />
      </el-form-item>

      <el-form-item prop="email">
        <span class="svg-container">
          <svg-icon icon-class="email" />
        </span>
        <el-input
          ref="email"
          v-model="registerForm.email"
          placeholder="邮箱"
          name="email"
          type="email"
          tabindex="4"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="role">
        <span class="svg-container">
          <svg-icon icon-class="peoples" />
        </span>
        <el-select
          v-model="registerForm.role"
          placeholder="选择角色"
          style="width: 100%"
        >
          <el-option label="学生" value="STUDENT" />
          <el-option label="教师" value="TEACHER" />
        </el-select>
      </el-form-item>

      <el-button
        :loading="loading"
        type="primary"
        style="width:100%;margin-bottom:30px;"
        @click.native.prevent="handleRegister"
      >
        注册
      </el-button>

      <div class="tips">
        <span>已有账号？</span>
        <el-link type="primary" @click="goToLogin">立即登录</el-link>
      </div>

    </el-form>
  </div>
</template>

<script>
import { register } from '@/api/user'
import { validUsername, validEmail } from '@/utils/validate'

export default {
  name: 'Register',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('用户名必须是4-16位字母或数字'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        callback()
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      if (!validEmail(value)) {
        callback(new Error('请输入有效的邮箱地址'))
      } else {
        callback()
      }
    }
    return {
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        role: 'STUDENT'
      },
      registerRules: {
        username: [
          { required: true, trigger: 'blur', validator: validateUsername }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePassword }
        ],
        confirmPassword: [
          { required: true, trigger: 'blur', validator: validateConfirmPassword }
        ],
        email: [
          { required: true, trigger: 'blur', validator: validateEmail }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      },
      loading: false,
      passwordType: 'password'
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (!valid) return false

        this.loading = true
        register({
          username: this.registerForm.username,
          password: this.registerForm.password,
          email: this.registerForm.email,
          role: this.registerForm.role
        }).then(response => {
          // 成功处理
          this.$message.success(response.message || '注册成功')
          setTimeout(() => {
            this.$router.push('/login')
          }, 1500)
        }).catch(error => {
          // 错误处理（重点修改部分）
          const errorResponse = error.response

          if (errorResponse) {
            // 情况1：后端返回的明确错误消息
            if (errorResponse.data && errorResponse.data.message) {
              this.$message.error(errorResponse.data.message)

              // 特殊处理用户名/邮箱已存在的情况
              if (errorResponse.data.message.includes('用户名')) {
                this.$refs.registerForm.validateField('username')
              } else if (errorResponse.data.message.includes('邮箱')) {
                this.$refs.registerForm.validateField('email')
              }
              // eslint-disable-next-line brace-style
            }
            // 情况2：HTTP状态码错误
            else {
              this.$message.error(`请求失败: ${errorResponse.status} ${errorResponse.statusText}`)
            }
            // eslint-disable-next-line brace-style
          }
          // 情况3：网络错误等
          else {
            this.$message.error(error.message || '网络错误，请检查连接')
          }
        }).finally(() => {
          this.loading = false
        })
      })
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100%;
  width: 100%;
  background-color: #2d3a4b;
  overflow: hidden;

  .register-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    text-align: center;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: #889aa4;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: #eee;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: #889aa4;
    cursor: pointer;
    user-select: none;
  }
}
</style>
