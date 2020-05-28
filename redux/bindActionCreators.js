/**
 * @description 直接分发（dispatch）actionCreator创建的action
 * @date 2020-05-28
 * @param {*} actionCreator action创建函数
 * @param {*} dispatch 分发action的函数
 * @returns 一个分发（dispatch）actionCreator创建的action的函数
 */
function bindActionCreator (actionCreator, dispatch) {
  return function (this, ...args) {
    return dispatch(actionCreator.apply(this, args)) // dispatch action
  }
}
/**
 * @description 直接分发传递进来的actionCreators所创建的actions
 * @date 2020-05-28
 * @export
 * @param {*} actionCreators value为action创建函数的对象 | 一个action创建函数
 * @param {*} dispatch 分发action的函数
 * @returns 一个对象或一个函数，直接分发actionCreators创建的actions
 */
export default function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(
      `bindActionCreators expected an object or a function, instead received ${
        actionCreators === null ? 'null' : typeof actionCreators
      }. ` +
        `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`
    )
  }
  // 返回一个对象，key为action创建函数的名字，value为分发actionCreator创建的action的函数
  const boundActionCreators = {}
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  return boundActionCreators
}