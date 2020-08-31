// 首次render时是mount
let isMount = true
let workInProgressHook = null
// App组件对应的fiber对象
const fiber = {
  // 保存该FunctionComponent对应的Hooks链表
  memoizedState: null,
  // 指向App函数
  stateNode: App,
}

function useState(initialState) {
  let hook
  if (isMount) {
    // mount时为该useState生成hook
    hook = {
      // 保存update的queue
      queue: {
        pending: null,
      },
      // 保存hook对应的state
      memoizedState: initialState,
      // 与下一个Hook连接形成单向无环链表
      next: null,
    }
    // 将hook插入fiber.memoizedState链表末尾
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook
    } else {
      workInProgressHook.next = hook
    }
    // 移动workInProgressHook指针
    workInProgressHook = hook
  } else {
    // update时找到对应hook
    hook = workInProgressHook
    // 移动workInProgressHook指针
    workInProgressHook = workInProgressHook.next
  }
  // update执行前的初始state
  let baseState = hook.memoizedState
  if (hook.queue.pending) {
    // 获取update环状单向链表中第一个update
    let firstUpdate = hook.queue.pending.next
    do {
      // 执行update action
      const action = firstUpdate.action
      baseState = action(baseState)
      firstUpdate = firstUpdate.next
    } while (firstUpdate !== hook.queue.pending) // 最后一个update执行完后跳出循环
    // 清空更新队列
    hook.queue.pending = null
  }
  // 将update action执行完后的state作为memoizedState
  hook.memoizedState = baseState
  return [baseState, dispatchAction.bind(null, hook.queue)]
}

function dispatchAction(queue, action) {
  // 创建update
  const update = {
    action,
    next: null,
  }
  // 环状单向链表操作
  if (queue.pending === null) {
    update.next = update
  } else {
    update.next = queue.pending.next
    queue.pending.next = update
  }
  queue.pending = update
  // 模拟React开始调度更新
  schedule()
}

function schedule() {
  // 更新前将workInProgressHook重置为fiber保存的第一个Hook
  workInProgressHook = fiber.memoizedState
  // 触发组件render
  fiber.stateNode()
  // 组件首次render为mount，以后再触发的更新为update
  isMount = false
}
