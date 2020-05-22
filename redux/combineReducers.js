/**
 * @description 组合reducers，生成一个根reducer
 * @date 2020-05-22
 * @export
 * @param {*} reducers
 * @returns reducer
 */
export default function combineReducers (reducers) {
  // reducers对象的key是要处理state子树，value是处理state子树的reducer
  const reducerKeys = Object.keys(reducers)
  // 去掉不是函数类型的reducer
  const finallyReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]
    if (typeof reducers[key] === 'function') {
      finallyReducers[key] = reducers[key]
    }
  }
  // 最终的state对象所包含的key
  const finallyKeys = Object.keys(finallyReducers)
  return function combination (state, action) {
    // 新的state
    const nextState = {}
    // state是否改变
    let hasChanged = false
    for (let i = 0; i < finallyKeys.length; i++) {
      // 根据key处理对应的state子树
      const key = finallyKeys[key]
      const reducer = finallyReducers[key]
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)
      nextState[key] = nextStateForKey
      // 如果state子树发生改变那么就可以认为整个state树发生改变
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    // 如果state发生改变就返回新的state，否则的话返回原来的state
    return hasChanged ? nextState : state
  }
}