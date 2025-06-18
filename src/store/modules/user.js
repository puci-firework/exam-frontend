import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getUserId, setUserId, removeUserId } from '@/utils/auth'
import { getName, setName, removeName } from '@/utils/auth'
import { getRole, setRole, removeRole } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    userId: getUserId(),
    name: getName(),
    role: getRole(),
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // 添加 SET_USERID 和 SET_ROLE
  SET_USERID: (state, userId) => {
    state.userId = userId
  },
  SET_NAME: (state, name) => {
    state.name = name
    setName(name)
  },
  SET_ROLE: (state, role) => {
    state.role = role
    setRole(role)
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        console.log('Login response:', data.data.token)
        commit('SET_TOKEN', data.data.token)
        // 确保用户ID是数字类型
        const userId = Number(data.data.userId)
        console.log('UserId', userId)
        if (isNaN(userId)) {
          throw new Error('无效的用户ID格式')
        }
        commit('SET_USERID', userId)
        commit('SET_NAME', data.data.username)
        commit('SET_ROLE', data.data.role)
        setToken(data.data.token)
        setUserId(data.data.userId)
        resolve()
      }).catch(error => {
        // console.log('User info:', error)
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      // 从state中获取token，或者从getters中获取
      const token = state.token

      // 调用API时传递userId
      logout(token).then(() => {
        removeToken() // 必须先移除token
        removeUserId() // 移除userId
        removeName()
        removeRole()
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        // 即使API调用失败，也清除前端状态
        removeToken()
        removeUserId()
        removeName()
        removeRole()
        resetRouter()
        commit('RESET_STATE')
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

