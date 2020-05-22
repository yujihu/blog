/**
 * 判断一个对象是否是简单对象，即通过Object或对象字面量创建
*/
export default function isPlainObject (obj) {
  if (typeof obj !== 'object' || obj === null) return false
  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }
  return Object.getPrototypeOf(obj) === proto
}