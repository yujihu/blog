function asyncToGenerator(fn) {
  return function () {
    const promise = new Promise((resolve, reject) => {
      const gen = fn.apply(this, Array.prototype.slice.call(arguments))
      const _next = (value) => {
        asyncGeneratorStep(resolve, reject, gen, _next, _throw, 'next', value)
      }

      const _throw = (err) => {
        asyncGeneratorStep(resolve, reject, gen, _next, _throw, 'throw', err)
      }
      _next()
    })
    return promise
  }
}

function asyncGeneratorStep(resolve, reject, gen, _next, _throw, key, param) {
  let info, value
  try {
    info = gen[key](param)
    value = info.value
  } catch (err) {
    return reject(err)
  }

  if (info.done) {
    return resolve(value)
  } else {
    Promise.resolve(value).then(_next, _throw)
  }
}

// test
const asyncFn = asyncToGenerator(function* () {
  const d = yield Promise.resolve('d')
  const e = yield new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('e')
    }, 1000)
  })
  const a = yield 'a'
  const c = yield Promise.reject('c')
  const b = yield Promise.resolve('b')
  return [a, b, c, d, e]
})

asyncFn().then(res => {
  console.info(res)
}, err => {
    console.error(err)
})
