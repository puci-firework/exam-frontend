import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getUserId, setUserId, removeUserId } from '@/utils/auth'
import { getName, setName, removeName } from '@/utils/auth'
import { resetRouter } from '@/router'
import { set } from 'nprogress'

const getDefaultState = () => {
  return {
    token: getToken(),
    userId: getUserId(),
    name: getName(),
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    // console.log('Setting token:', token)
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
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
        commit('SET_NAME', data.data.username)
        setToken(data.data.token)
        setUserId(data.data.userId)
        setName(data.data.username)
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
      // 从state中获取userId，或者从getters中获取
      const userId = state.userId

      // 调用API时传递userId
      logout(userId).then(() => {
        removeToken() // 必须先移除token
        removeUserId() // 移除userId
        removeName()
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        // 即使API调用失败，也清除前端状态
        removeToken()
        removeUserId()
        removeName()
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

