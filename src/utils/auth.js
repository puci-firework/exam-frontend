import Cookies from 'js-cookie'

const TokenKey = 'exam_token'
const UserId = 'user_id'
const Name = 'name'
const Role = 'role'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, `Bearer ${token}`)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getUserId() {
  const userId = Cookies.get(UserId)

  // 确保返回数字或 null
  if (userId && !isNaN(userId)) {
    return Number(userId)
  }

  console.warn('无效的用户ID Cookie值:', userId)
  return null
}

// 确保存储的是字符串
export function setUserId(userId) {
  // 转换为字符串存储
  return Cookies.set(UserId, String(userId))
}

export function removeUserId() {
  return Cookies.remove(UserId)
}

export function getName() {
  return Cookies.get(Name)
}

export function setName(name) {
  return Cookies.set(Name, name)
}

export function removeName() {
  return Cookies.remove(Name)
}

export function getRole() {
  return Cookies.get(Role)
}

export function setRole(role) {
  return Cookies.set(Role, role)
}

export function removeRole() {
  return Cookies.remove(Role)
}
