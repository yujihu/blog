/**
 * 1. new Promise时，需要传递一个 executor 执行器，执行器立刻执行
 * 2. executor 接受两个参数，分别是 resolve 和 reject
 * 3. promise 只能从 pending 到 rejected, 或者从 pending 到 fulfilled
 * 4. promise 的状态一旦确认，就不会再改变
 * 5. promise 都有 then 方法，then 接收两个参数，分别是 promise 成功的回调 onFulfilled,和 promise 失败的回调 onRejected
 * 6. 如果调用 then 时，promise已经成功，则执行 onFulfilled，并将promise的值作为参数传递进去。
 *      如果promise已经失败，那么执行 onRejected, 并将 promise 失败的原因作为参数传递进去。
 *      如果promise的状态是pending，需要将onFulfilled和onRejected函数存放起来，等待状态确定后，再依次将对应的函数执行(发布订阅)
 * 7. then 的参数 onFulfilled 和 onRejected 可以缺省
 * 8. promise 可以then多次，promise 的then 方法返回一个 promise
 * 9. 如果 then 返回的是一个结果，那么就会把这个结果作为参数，传递给下一个then的成功的回调(onFulfilled)
 * 10.如果 then 中抛出了异常，那么就会把这个异常作为参数，传递给下一个then的失败的回调(onRejected)
 * 11.如果 then 返回的是一个promise，那么会等这个promise执行完，promise如果成功，就走下一个then的成功，如果失败，就走下一个then的失败
 */
// 测试 promises-aplus-tests ./js/Promise.js
const PENDING = Symbol('pending')
const FULFILLED = Symbol('fulfilled')
const REJECTED = Symbol('rejected')

class Promise {
  constructor(executor) {
    this.state = PENDING
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
    const resolve = (value) => {
      if (this.state === PENDING) {
        this.state = FULFILLED
        this.value = value
        this.onFulfilledCallbacks.forEach((fn) => fn())
      }
    }
    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED
        this.reason = reason
        this.onRejectedCallbacks.forEach((fn) => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : (value) => value
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err) => {
            throw err
          }
    const promise = new Promise((resolve, reject) => {
      if (this.state === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value)
            resolvePromise(promise, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        }, 0)
      }
      if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        }, 0)
      }
      if (this.state === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value)
              resolvePromise(promise, x, resolve, reject)
            } catch (err) {
              reject(err)
            }
          }, 0)
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason)
              resolvePromise(promise, x, resolve, reject)
            } catch (err) {
              reject(err)
            }
          }, 0)
        })
      }
    })
    return promise
  }
  catch(onRejected) {
    return this.then(null, onRejected)
  }
  finally(fn) {
    return this.then(
      (x) => {
        Promise.resolve(fn()).then(() => x)
      },
      (r) => {
        Promise.resolve(fn()).then(() => {
          throw r
        })
      }
    )
  }

  static resolve (param) {
    if (param instanceof Promise) {
      return param
    }
    const promise = new Promise((resolve, reject) => {
      resolvePromise(promise, param, resolve, reject)
    })
    return promise
  }

  static reject (param) {
    return new Promise((_, reject) => {
      reject(param)
    })
  }

  static all (promises) {
    return new Promise((resolve, reject) => {
      const result = []
      if (!promises || !promises.length) {
        return resolve(result)
      } else {
        let c = 0
        function resolveValue(i, v) {
          result[i] = v
          c++
          if (c === promises.length) {
            resolve(result)
          }
        }
        for (let i = 0; i < promises.length; i++) {
          Promise.resolve(promise[i]).then(x => {
            resolveValue(i, x)
          }, r => {
              reject(r)
          })
        }
      }
    })
  }

  static race (promises) {
    return new Promise((resolve, reject) => {
      if (!promises || !promise.length) {
        return
      } else {
        for (let i = 0; i < promises.length; i++) {
          Promise.resolve(promises[i]).then(resolve, reject)
        }
      }
    })
  }
}

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) return reject(new TypeError('Chaining cycle'))
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let isCalled = false
    try {
      const then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (isCalled) return
            isCalled = true
            resolvePromise(promise, y, resolve, reject)
          },
          (r) => {
            if (isCalled) return
            isCalled = true
            reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (err) {
      if (isCalled) return
      isCalled = true
      reject(err)
    }
  } else {
    resolve(x)
  }
}

Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

module.exports = Promise
