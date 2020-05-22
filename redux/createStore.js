import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'
/**
 * @description store创建函数
 * @date 2020-05-22
 * @export
 * @param {*} reducer 一个函数，接受两个参数，用来根据传入的action生成新的state
 * @param {*} preloadState 初始state
 * @param {*} enhancer 一个组合store creator的高阶函数，返回一个新的强化的store creator
 * @returns
 */
export default function createStore (reducer, preloadState, enhancer) {
  // 只能有一个enhancer
  if ((typeof preloadState === 'function' && typeof enhancer === 'function') || (typeof enhancer === 'function' && typeof arguments[3] === 'function')) {
    throw new Error(
      'It looks like you are passing several store enhancers to ' +
        'createStore(). This is not supported. Instead, compose them ' +
        'together to a single function.'
    )
  }
  // reducer必须是函数类型
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
  // 如果第二参数是函数的话，说明它是一个enhancer
  if (typeof preloadState === 'function') {
      enhancer = preloadState
      preloadState = undefined
  }
  // enhancer如果存在则必须是函数
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
       throw new Error('Expected the enhancer to be a function.')
    }
    // 执行enhancer
    return enhancer(createStore)(reducer, preloadedState)
  }

  // 当前reducer
  let currentReducer = reducer
  // 当前state
  let currentState = preloadState
  // 是否正在dispatch action
  let isDispatching = false
  // 当前的观察者列表
  let currentListeners = []
  // 该对象是对currentListeners的浅拷贝，用来避免在dispatch action时订阅或者取消订阅影响currentListeners，导致bug
  // 注意不论我们订阅或者是取消订阅，操作的都是nextListeners，当我们更新完state，执行观察者的时候，会更新currentListeners，指向nextListeners
  let nextListeners = currentListeners

  /**
   * @description 获取store的状态树
   * @date 2020-05-22
   * @returns
   */
  function getState () {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
        'The reducer has already received the state as an argument. ' +
        'Pass it down from the top reducer instead of reading it from the store.'
      )
    }
    return currentState
  }

  /**
   * @description 分发action
   * @date 2020-05-22
   * @param {*} action 简单对象
   * @returns
   */
  function dispatch (action) {
    // action必须是一个简单对象
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      )
    }
    // action对象必须拥有type属性
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          'Have you misspelled a constant?'
      )
    }
    // 禁止在reducer中分发action
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }
    try {
      // 正在dispatch action
      isDispatching = true
      // 生成新的state，禁止在生成过程中分发action
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }
    // 更新观察者列表，并通知相关观察者
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]()
    }
    // 返回action对象
    return action
  }

  /**
  * @description 确保nextListeners是对currentListeners的浅拷贝
  * @date 2020-05-22
  */
  function ensureCanMutateNextListeners () {
    // 如果nextListeners指向currentListeners，那么就浅拷贝currentListeners
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }
  /**
   * @description 订阅state的变化
   * @date 2020-05-22
   * @param {*} listener 在state发生变化后执行的回调函数
   * @returns 解除订阅的函数
   */
  function subscribe (listener) {
    // listener必须是函数类型
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }
    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
        'If you would like to be notified after the store has been updated, subscribe from a ' +
        'component and invoke store.getState() in the callback to access the latest state. ' +
        'See https://redux.js.org/api/store#subscribelistener for more details.'
      )
    }
    // 确保nextListeners指向的不是currentListeners，而是currentListeners的浅拷贝
    ensureCanMutateNextListeners()
    // 将listener加入到nextListeners
    nextListeners.push(listener)
    // 已经订阅
    let isSubscribed = true
    // 返回取消订阅函数
    return function unSubscribe () {
      // 如果已经取消订阅，则不需要任何操作
      if (!isSubscribed) return
      // 找到需要取消订阅的listener的索引
      const index = nextListeners.indexOf(listener)
      // 将其从nextListeners中移除
      nextListeners.splice(index, 1)
      // 取消订阅成功
      isSubscribed = false
    }
  }

  /**
   * @description 替换reducer
   * @date 2020-05-22
   * @param {*} nextReducer
   */
  function replaceReducer (nextReducer) {
    // 新的reducer也必须是函数类型
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the reducer to be a function.')
    }
    // 替换reducer
    currentReducer = nextReducer
    // 分发替换reducer的action
    dispatch({
      type: ActionTypes.REPLACE
    })
  }
  // 返回store对象，包括四个方法属性
  return {
    getState, // 获取当前state
    dispatch, // 分发action，执行reducer生成新的state，并通知listener
    subscribe, // 订阅dispatch
    replaceReducer // 替换reducer
  }
}
