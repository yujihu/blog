### 1.核心概念
- state：应用的状态，树形结构，可以囊括很多子state。
- action：想要更改state中的数据，需要发起（dispatch）一个action。action是一个简单对象，描述了state的变化。按照约定，action具有type属性来描述它的类型。
- action creator：一个创建action的函数，是一个创建action的工厂。
- reducer：根据action的描述来生成新的state。
- dispatch：发起action的函数，其内部会调用reducer来生成新的state。
- store：维持应用所有state树的一个对象，改变store内state的唯一途径是对它dispatch一个action。一个应用有且仅有一个store。
- store creator：一个创建store的函数。
- store enhancer：一个组合store creator的高阶函数，返回一个强化班的store creator，通过复合函数改变store的接口。

### 2.核心API
#### 2.1 store
store是一个对象，拥有四个方法属性。通过createStore函数创建store。

store对象所包含的方法如下：

- getState()：返回当前store的state树。
- dispatch(action)：分发action，这是改变state的唯一方式。根据当前state和action，经由reducer生成新的state。
- subscribe(listener)：添加一个变化监听器。每当dispatch action的时候就会执行listener，state树中的一部分可能已经发生了变化，可以通过getState()来拿到当前state。
- replaceReducer(nextReducer)：替换store当前用来计算state的reducer。

#### 2.2 createStore
```javascript
createStore(reducer, [preloadedState], enhancer)
```
创建一个store用来存放应用的所有state，一个应用有且仅有一个store。

参数说明：
- reducer：一个函数，接受两个参数，分别是当前state树和要处理的action，返回新的state树。
- preloadedState：可选参数，初始state。
- enhancer[ɪnˈhɑːnsə(r)]：一个组合store creator的高阶函数，返回一个新的强化的store creator，即返回一个价钱版的createStore。

#### 2.3 combineReducers
随着应用程序变得越来越复杂，可以考虑将reducer拆分成多个单独的函数，独立负责state的一部分。

```javascript
combineReducers(reducers)
```

参数说明：

- reducers：一个对象，它的值（value）对应不同的reducer函数，这些reducer函数会被合并成一个总的reducer。

返回值：返回一个新的reducer，调用reducers对象里的所有reducer，构造一个与reduces对象结构相同的state（新的state对象与reducers对象拥有相同的key）。

combineReducers(reducers)会生成一个reducer，调用我们传入的各个子reducer，子reducer会根据它的key来筛选出state的一部分来进行处理，最后将所有子reducer的处理结果合并成一个新的state。

由combineReducers()返回的state对象，会将传入的每个 reducer返回的state按其传递给combineReducers()时对应的 key进行命名。例如，我们可以调用`combineReducers({ todos: myTodosReducer, counter: myCounterReducer })`将state结构变为`{ todos, counter }`。

#### 2.4 applyMiddleware
middleware可以让我们包装store的dispatch方法来增强其功能。它接受dispatch作为参数，返回一个新的dispatch。新的dispatch作为下一个middleware的参数。middleware函数的典型结构为：`({ getState, dispatch }) => next => action => { next(state) }`。

```javascript
applyMiddleware(...middlewares)
```

参数说明：
- middlewares：middleware数组对象，每个middleware接受store的dispatch和getState方法作为参数，返回一个函数，该函数会被传入下一个middleware作为dispatch方法，被称为next。数组的最后一个middleware会接受真实store dispatch方法作为next参数。注意在组合middlewara的过程中不可以dispatch action，因为此时的dispatch并不是最终的dispatch。

返回值：返回一个函数，应用了middleware后的store enhancer，即返回一个增强版的createStore。这个store enhancer的签名是`createStore => createStore`。

#### 2.5 compose
从右到左来组合多个函数，即先执行右侧函数，执行结果作为左侧函数的参数。

```javascript
compose(...functions)
```

参数说明：需要组合的多个函数，每个函数接受一个参数，返回值提供给左侧的函数作为参数，最右侧函数可以接受多个参数。

`compose(funcA, funcB, funcC)` => `compose(funcA(funcB(funcC())))`

#### 2.6 bindActionCreators

```javascript
bindActionCreators(actionCreators, dispatch)
```
将一个value为不同action creator的对象，转换成拥有相同key的对象，value为使用dispatch分发action creator所创建的action的函数。

参数说明：
- actionCreators：一个action creator函数或者是一个value为action creator的对象。
- store的dispatch函数

返回值：
- 如果传入的是一个action creator函数，那么返回结果也会是一个函数，这个函数直接分发action creator所创建的action。
- 如果传入的是一个value为action creator的对象，那么返回的也会是一个对象，返回的对象与传入的对象拥有相同的key，value为直接分发对应action creator所创建的action的函数。

示例:
```javascript
// action creator
function addTodo (text) {
  return {
    type: 'ADD_TODO',
    text
  }
}
// action creator
function removeTodo (id) {
  return {
    type: 'REMOVE_TODO',
    id
  }
}

const boundActionCreators = bindActionCreators(TodoActionCreators, dispatch)
// boundActionCreators的结构如下
// {
//   addTodo: function (this, ...args) {
//     return dispatch(addTodo.apply(this, args))
//   },
//   removeTodo: function (this, ...args) {
//     return dispatch(removeTodo.apply(this, args))
//   }
// }
```

使用场景：

需要把action creator传递给子组件，但是又不想让这个子组件察觉到Redux的存在。

```javascript
const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators(appActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
```

### 3.源码解析

#### 3.1 createStore
```javascript
import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'
/**
 * @description store创建函数
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
  */
  function ensureCanMutateNextListeners () {
    // 如果nextListeners指向currentListeners，那么就浅拷贝currentListeners
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }
  /**
   * @description 订阅state的变化
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
```

#### 3.2 combineReducers
```javascript
/**
 * @description 组合reducers，生成一个根reducer
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
```

#### 3.3 compose
```javascript
export default function compose (...fns) {
  if (fns.length === 0) {
    return arg => arg
  }

  if (fns.length === 1) {
    return fns[0]
  }

  return fns.reduce((a, b) => (...args) => a(b(...args)))
}
```

具体执行效果：
```javascript
const f0 = (x) => { return x * 2 }
const f1 = (x) => { return x + 1 }
const f2 = (x) => { console.log(x) }
compose(f2, f1, f0)(100) // 执行 f2(f1(f0(100))) 打印201
```

#### 3.4 applyMiddleware
react-thunk是一个典型的middleware，用来处理异步action。通常情况下action是一个包含type属性的对象，但是通过使用指定的middleware，action可以是一个函数，这个函数会被指定的middleware执行。react-thunk的源码如下：
```javascript
function createThunkMiddleware (extraArgument) {
  return ({dispatch, getState}) => next => action => {
    // 如果action为函数，那么就执行它
    if (typeof action === 'function') {
      // 真正执行的dispatch是经过middleware包装后的dispatch
      return action(dispatch, getState, extraArgument)
    }
    return next(action)
  }
}
const thunk = createThunkMiddleware()
thunk.withExtraArgument = createThunkMiddleware

export default thunk
```

middleware的主要功能是包装store的dispatch方法，applyMiddleware的主要功能是用来组合middleware。

```javascript
import compose from './compose'

export default function applyMiddleware (middlewares) {
  return createStore => (...args) => {
    // 原始store对象
    const store = createStore(...args)
    // 在构造middleware的过程中禁止dispatch action
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
        'Other middleware would not be applied to this dispatch.'
      )
    }
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)
    // 返回一个新的store对象
    return {
      ...store,
      dispatch // 经过包装后的dispatch
    }
  }
}
```

#### 3.5 bindActionCreators
```javascript
/**
 * @description 直接分发（dispatch）actionCreator创建的action
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
```

### 4. 总结

- 应用中有且仅有一个store，可以将reducer进行拆分来管理不同的自子state，通过combineReducers来创建一个跟reducer。
- 不要直接修改state对象，而是要生成一个全新的对象。例如，不要使用`Object.assign(state, newData)`，而应该使用`Object.assign({}, state, newData)`。
- 在reducer层级的任何一级都可以调用combineReducers，我们可以将复杂的reducer拆分成单独的孙子级的reducer，甚至是更多层。
- middleware只是包装了store的dispatch方法。
- applyMiddleware的作用是组合middleware，生成新的store，store的dispatch方法经过middleware包装。