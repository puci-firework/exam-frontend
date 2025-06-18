<!-- src/views/admin/UserManagement.vue -->
<template>
  <div class="user-management-container">
    <el-card shadow="hover">
      <div class="header">
        <h2>用户管理</h2>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showCreateDialog"
        >
          添加用户
        </el-button>
      </div>

      <!-- 搜索和过滤 -->
      <div class="filter-container">
        <el-input
          v-model="listQuery.search"
          placeholder="搜索用户名或邮箱"
          style="width: 300px"
          clearable
          @keyup.enter.native="handleFilter"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleFilter"
          />
        </el-input>

        <el-select
          v-model="listQuery.role"
          placeholder="按角色筛选"
          clearable
          style="width: 150px; margin-left: 10px"
          @change="handleFilter"
        >
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <!-- 用户表格 -->
      <el-table
        v-loading="loading"
        :data="users"
        border
        fit
        highlight-current-row
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
          align="center"
        />

        <el-table-column
          prop="username"
          label="用户名"
          min-width="150"
        />

        <el-table-column
          prop="email"
          label="邮箱"
          min-width="200"
        />

        <el-table-column
          prop="role"
          label="角色"
          width="120"
          align="center"
        >
          <template #default="{row}">
            <el-tag :type="getRoleTagType(row.role)">
              {{ formatRole(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
          align="center"
        >
          <template #default="{row}">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="220"
          align="center"
        >
          <template #default="{row}">
            <el-button
              size="mini"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getUsers"
      />
    </el-card>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
    >
      <el-form
        ref="userForm"
        :model="tempUser"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input v-model="tempUser.username" />
        </el-form-item>

        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input v-model="tempUser.email" />
        </el-form-item>

        <el-form-item
          label="密码"
          prop="password"
          v-if="isCreate"
        >
          <el-input
            v-model="tempUser.password"
            type="password"
          />
        </el-form-item>

        <el-form-item
          label="角色"
          prop="role"
        >
          <el-select
            v-model="tempUser.role"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createUser():updateUser()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/admin'
import { formatDate } from '@/utils/date'

export default {
  name: 'UserManagement',
  components: { Pagination },
  data() {
    return {
      users: [],
      total: 0,
      loading: false,
      listQuery: {
        page: 1,
        limit: 20,
        search: '',
        role: ''
      },
      roleOptions: [
        { value: 'ADMIN', label: '管理员' },
        { value: 'TEACHER', label: '教师' },
        { value: 'STUDENT', label: '学生' }
      ],
      dialogVisible: false,
      dialogTitle: '',
      dialogStatus: '',
      tempUser: {
        id: undefined,
        username: '',
        email: '',
        password: '',
        role: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    isCreate() {
      return this.dialogStatus === 'create'
    }
  },
  created() {
    this.getUsers()
  },
  methods: {
    async getUsers() {
      this.loading = true
      try {
        const { data } = await getUsers({
          search: this.listQuery.search,
          role: this.listQuery.role,
          page: this.listQuery.page,
          limit: this.listQuery.limit
        })
        this.users = data.items
        this.total = data.total
      } catch (error) {
        console.error('获取用户列表失败:', error)
        this.$message.error('获取用户列表失败')
      } finally {
        this.loading = false
      }
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getUsers()
    },

    showCreateDialog() {
      this.dialogStatus = 'create'
      this.dialogTitle = '添加用户'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
        this.tempUser = {
          id: undefined,
          username: '',
          email: '',
          password: '',
          role: ''
        }
      })
    },

    handleEdit(row) {
      this.dialogStatus = 'update'
      this.dialogTitle = '编辑用户'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
        this.tempUser = Object.assign({}, row)
      })
    },

    async createUser() {
      this.$refs.userForm.validate(async valid => {
        if (valid) {
          try {
            await createUser(this.tempUser)
            this.dialogVisible = false
            this.$message.success('用户创建成功')
            this.getUsers()
          } catch (error) {
            console.error('创建用户失败:', error)
            this.$message.error('创建用户失败')
          }
        }
      })
    },

    async updateUser() {
      this.$refs.userForm.validate(async valid => {
        if (valid) {
          try {
            const { id, username, email, role } = this.tempUser
            await updateUser(id, { username, email, role })
            this.dialogVisible = false
            this.$message.success('用户更新成功')
            this.getUsers()
          } catch (error) {
            console.error('更新用户失败:', error)
            this.$message.error('更新用户失败')
          }
        }
      })
    },

    handleDelete(row) {
      this.$confirm(`确定删除用户 "${row.username}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteUser(row.id)
          this.$message.success('删除成功')
          this.getUsers()
        } catch (error) {
          console.error('删除用户失败:', error)
          this.$message.error('删除用户失败')
        }
      }).catch(() => {})
    },

    formatDate,

    formatRole(role) {
      const map = {
        ADMIN: '管理员',
        TEACHER: '教师',
        STUDENT: '学生'
      }
      return map[role] || role
    },

    getRoleTagType(role) {
      const map = {
        ADMIN: 'danger',
        TEACHER: 'warning',
        STUDENT: 'success'
      }
      return map[role] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.user-management-container {
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .filter-container {
    margin-bottom: 20px;
  }
}
</style>
