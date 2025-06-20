/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function validUsername(str) {
  const reg = /^[a-zA-Z0-9]{4,16}$/
  return reg.test(str)
}

export function validEmail(str) {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return reg.test(str)
}
