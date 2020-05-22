### 1.核心概念
- state：应用的状态，树形结构，可以囊括很多子state。
- action：想要更改state中的数据，需要发起（dispatch）一个action。action是一个对象，描述了state的变化。按照约定，action具有type属性来描述它的类型。
- reducer：根据action的描述来修改state。
- dispatch：发起action的函数。
- store：维持应用所有state树的一个对象，改变store内state的唯一途径是对它dispatch一个action。一个应用有且仅有一个store。

### 2.核心API
#### 2.1 store
store是一个对象，拥有四个方法属性。通过createStore函数创建store。

store对象所包含的方法如下：

- getState()：返回当前store的state树。
- dispatch(action)：分发action，这是改变state的唯一方式。根据当前state和action，经由reducer生成新的state。
- subscribe(listener)：添加一个变化监听器。每当dispatch action的时候就会执行，state树种的一部分可能已经发生了变化，可以通过getState()来拿到当前state。
- replaceReducer(nextReducer)：替换store当前用来计算state的reducer。

#### 2.2 createStore
```javascript
createStore(reducer, [preloadedState], enhancer)
```
创建一个store用来存放应用的所有state，一个应用有且仅有一个store。

参数说明：
- reducer：一个函数，接受两个参数，分别是当前state树和要处理的action，返回新的state树。
- preloadedState：可选参数，初始state。
- enhancer[ɪnˈhɑːnsə(r)]：一个组合store creator的高阶函数，返回一个新的强化的store creator。

#### 2.3 combineReducers
随着应用程序变得越来越复杂，可以考虑将reducer拆分成多个单独的函数，独立负责state的一部分。

```javascript
combineReducers(reducers)
```

参数说明：

- reducers：一个对象，它的值（value）对应不同的reducer函数，这些reducer函数后面会被合并成一个。

返回值：返回一个新的reducer，调用reducers对象里的所有reducer，构造一个与reduces对象结构相同的state（改state对象与reducers对象拥有相同的key）。

combineReducers(reducers)会生成一个reducer，调用我们传入的各个子reducer，子reducer会根据它的key来筛选出state的一部分来进行处理，最后将所有子reducer的处理结果合并成一个新的state。

由 combineReducers() 返回的 state 对象，会将传入的每个 reducer 返回的 state 按其传递给 combineReducers() 时对应的 key 进行命名。例如，我们可以调用`combineReducers({ todos: myTodosReducer, counter: myCounterReducer })`将state结构变为`{ todos, counter }`。

#### 2.4 applyMiddleware
middleware可以让我们包装store的dispatch方法来增强其功能。它接受dispatch作为参数，返回一个新的dispatch。新的dispatch作为下一个middleware的参数。middleware函数的典型结构为：`({ getState, dispatch }) => next => action => { next(state) }`

```javascript
applyMiddleware(...middlewares)
```

参数说明：
- middlewares：middleware数组对象，每个middleware接受store的dispatch和getState方法作为参数，返回一个函数，该函数会被传入下一个middleware作为dispatch方法，被称为next。数组的最后一个middleware会接受真实store dispatch方法作为next参数。

返回值：返回一个函数，应用了 middleware 后的 store enhancer。这个 store enhancer 的签名是 `createStore => createStore`

#### 2.5 compose
从由到左来组合多个函数。

```javascript
compose(...functions)
```

参数说明：需要组合的多个函数，每个函数接受一个参数，返回值提供给左侧的函数作为参数，最右侧函数可以接受多个参数。

`compose(funcA, funcB, funcC)` => `compose(funcA(funcB(funcC())))`

### 3.源码解析

#### 3.1 createStore
```javascript
export default function createStore(reducer, preloadedState, enhancer) {
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
  // 如果传递给preloadedState的是一个函数的话，那么它就是一个enhancer
  if (typeof preloadedState === 'function') {
    enhancer = preloadedState
    preloadedState = undefined
  }
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
       throw new Error('Expected the enhancer to be a function.')
    }
    return enhancer(createStore)(reducer, preloadedState)
  }
  // 当前reducer
  let currentReducer = reducer
  // 当前state
  let currentState = preloadedState
  // 订阅者集合
  let currentListeners = []
  // currentListeners不允许改变，nextListeners承担改变
  // nextListeners是对currentListeners的拷贝
  let nextListeners = currentListeners
  // 是否正在有dispatch在运行
  let isDispatching = false

  // 获取当前state
  function getState () {
    // 如果有 dispatch 正在执行则报错
    if (isDispatching) throw new Error("xxxx 具体信息省略")
    return currentState
  }
  
  // 如果nextListeners和currentListeners是同一数组引用，那么就拷贝一份currentListeners
  function ensureCanMutateNextListeners () {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice ()
    }
  }

  function subscribe (listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }
    // 如果正在有 dispatch 执行则报错
    if (isDispatching) {
      throw new Error("xxx")
    }
    // 记录是够订阅过，为退订操作准备
    let isSubscribed = true
    ensureCanMutateNextListeners()
    nextListeners.push(listener)
    return function unsubscribe () {
      // 已经退订了就不管了
      if (!isSubscribed) return
      if (isDispatching) throw new Error ("xxx 具体信息省略")
      isSubscribed = false
      ensureCanMutateNextListeners ()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  // 分发action
  function dispatch (action) {
    //action 必须是一个对象
    //action.type 不能为 undefined
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }
    try {
      isDispatching = true
      // 更改state
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }
    // 执行订阅者
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }
    return action
  }

  function replaceReducer (nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }
    // 更新reducer
    currentReducer = nextReducer
    // 用新的reducer更新state
    dispatch({ type: ActionTypes.REPLACE })
  }

  return {
    getState, // 获取当前state树
    subscribe, // 订阅action
    dispatch, // 分发action
    replaceReducer // 替换reducer
  }
}
```

#### 3.2 combineReducers
```javascript
export default function combineReducers (reducers) {
  // 获取reducers的key
  const reducerKeys = Object.keys(reducers)
  // 确保reducers的每一个value都是函数
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys [i]
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers [key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)
  // 返回新的reducer
  return function combination (state = {}, action) {
    // state是否发生改变
    let hasChanged = false
    // 新的state
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      // state树中子state的key
      const key = finalReducerKeys[i]
      // 子reducer
      const reducer = finalReducers[key]
      // 之前的子state
      const previousStateForKey = state[key]
      // 新的子state
      const nextStateForKey = reducer(previousStateForKey, action)
      // 更新对应的state
      nextState[key] = nextStateForKey
      // 判断state是否发生改变
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    // 返回新的state
    return hasChanged ? nextState : state
  }
}
```

#### 3.3 compose
```javascript
export default function compose (...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
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
react-thunk是一个典型的middleware，用来处理异步action。通常情况下action是一个包含type属性的对象，但是通过使用指定的middleware，action可以是一个函数，这个函数会被指定的middle执行。react-thunk的源码如下：
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
export default function applyMiddleware (...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    // 将dispatch初始化为一个会抛出错误的函数，避免在组合middleware时执行dispatch
    let dispatch = () => {
      throw new Error( 'Dispatching while constructing your middleware is not allowed. ' + 'Other middleware would not be applied to this dispatch.')
    }
    // middleware 
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    // 更新dispatch
    dispatch = compose(...chain)(store.dispatch)
    return {
      ...store,
      dispatch
    }
  }
}
```

### 4. 小贴士

- 应用中有且仅有一个store，可以将reducer进行拆分来管理不同的自子state，通过combineReducers来创建一个跟reducer。
- 不要直接修改state对象，而是要生成一个全新的对象。例如，不要使用`Object.assign(state, newData)`，而应该使用`Object.assign({}, state, newData)`。
- 在reducer层级的任何一级都可以调用combineReducers，我们可以将复杂的reducer拆分成单独的孙子级的reducer，甚至是更多层。
- middleware只是包装了store的dispatch方法。
- applyMiddleware的作用是组合middleware，生成新的store，store的dispatch方法经过middleware包装。