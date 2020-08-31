// https://github.com/vuejs/vue/blob/dev/src/core/instance/events.js
export function eventMixin(Vue) {
  Vue.prototype.$on = function (event, fn) {
    const vm = this
    if (Array.isArray(event)) {
      for (let i = 0; i < event.length; i++) {
        vm.$on(event[i], fn)
      }
    } else {
      ;(vm._events[event] || (vm._events[event] = [])).push(fn)
    }
    return vm
  }

  Vue.prototype.$off = function (event, fn) {
    const vm = this
    // 如果没有传参数，则清空所有事件的监听函数
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    if (Array.isArray(event)) {
      for (let i = 0; i < event.length; i++) {
        vm.$off(event[i], fn)
      }
      return vm
    }

    const cbs = vm._events[event]
    if (!cbs) {
      return vm
    }
    // 如果没有指定要移除的回调函数，则移除该事件下所有的回调函数
    if (!fn) {
      vm._events[event] = null
      return vm
    }

    let cb = null
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.slice(i, 1)
        break
      }
    }
    return vm
  }

  Vue.prototype.$emit = function (event) {
    const vm = this
    const cbs = vm._events[event]
    if (cbs) {
      const args = Array.prototype.slice.call(arguments, 1)
      for (let i = 0; i < cbs.length; i++) {
        cbs[i].apply(vm, args)
      }
    }
    return vm
  }

  Vue.prototype.$once = function (event, fn) {
    const vm = this
    function on() {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    // 这个赋值是在$off方法里会用到的
    // 比如我们调用了vm.$off(fn)来移除fn回调函数，然而我们在调用$once的时候，实际执行的是vm.$on(event, on)
    // 所以在event的回调函数数组里添加的是on函数，这个时候要移除fn，我们无法在回调函数数组里面找到fn函数移除，只能找到on函数
    // 我们可以通过on.fn === fn来判断这种情况，并在回调函数数组里移除on函数
    on.fn = fn
    vm.$on(event, on)
    return vm
  }
}
