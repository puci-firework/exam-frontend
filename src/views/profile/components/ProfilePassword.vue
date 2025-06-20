<template>
  <el-form
    ref="form"
    :model="form"
    label-width="100px"
    label-position="left"
    :rules="rules"
  >
    <el-form-item label="原密码" prop="oldPassword">
      <el-input v-model="form.oldPassword" type="password" show-password />
    </el-form-item>

    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="form.newPassword" type="password" show-password />
    </el-form-item>

    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" type="password" show-password />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">修改密码</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'ProfilePassword',
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.newPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    return {
      form: {
        userId: null,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
          { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/,
            message: '必须包含大小写字母和数字', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  mounted(){
    this.form.userId = this.userId
  },
  methods: {
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.form.userId = this.userId
          this.$emit('submit', this.form)
          this.$refs.form.resetFields()
        }
      })
    }
  }
}
</script>
