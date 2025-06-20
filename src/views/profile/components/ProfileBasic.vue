<template>
  <el-form
    ref="form"
    :model="form"
    label-width="100px"
    label-position="left"
    :rules="rules"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" disabled />
    </el-form-item>

    <el-form-item label="姓名" prop="fullName">
      <el-input v-model="form.fullName" />
    </el-form-item>

    <el-form-item label="电子邮箱" prop="email">
      <el-input v-model="form.email" />
    </el-form-item>

    <el-form-item label="手机号码" prop="phone">
      <el-input v-model="form.phone" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">保存修改</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'ProfileBasic',
  props: {
    profile: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form: {
        userId: null,
        username: '',
        fullName: '',
        email: '',
        phone: ''
      },
      rules: {
        fullName: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    profile: {
      immediate: true,
      deep: true,
      handler(val) {
        this.form = { ...val }
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('submit', this.form)
        }
      })
    }
  }
}
</script>
