(function (modules) {
  // 缓存已经安装过的模块
  var installedModules = {}
  // 存储chunk的加载状态，当值为0时代表chunk已经加载完毕
  var installedChunks = {}
  /**
   * @description 模块加载函数
   * @date 2020-05-22
   * @param {*} moduleId 模块ID
   * @returns 模块的导出
   */
  function __webpack_require__(moduleId) {
    // 如果该模块已经安装过，那么直接返回安装过的模块导出
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }
    // 构造模块，并缓存
    var module = (installedModules[moduleId] = {
      i: moduleId, // 模块ID，即该模块在modules中的索引
      l: false, // 是否已经加载完毕
      exports: {} // 模块导出
    })
    // 执行modules中指定索引的元素函数，模块的导出值会绑定到exports上
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    )
    // 模块加载完毕
    module.l = true
    // 返回模块的导出值
    return module.exports
  }

  __webpack_require__.e = function requireEnsure(chunkId) {
    if (installedChunks[chunkId] === 0) { // chunk已经加载成功
      // 直接返回fulfilled状态的promise
      return new Promise(function (resolve) {
        resolve()
      })
    }
    if (installedChunks[chunkId]) { // chunk正在加载中
      // 返回存放在installedChunks中的promise对象
      return installedChunks[chunkId][2]
    }
    // 构造一个新的promise对象，用来通知chunk已经加载完毕
    var promise = new Promise(function (resolve, reject) {
      installedChunks[chunkId] = [resolve, reject]
    })
    installedChunks[chunkId][2] = promise
    // 采用jsonp的方式加载chunk文件
    var head = document.querySelector('head')
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.charset = 'utf-8'
    script.async = true
    script.timeout = 120000
    script.src = __webpack_require__.p + '' + chunkId + '.bundle.js'
    script.onload = script.onerror = onScriptComplete
    var timer = setTimeout(onScriptComplete, 120000)
    function onScriptComplete() {
      clearTimeout(timer)
      script.onload = script.onerror = timer = null
      var chunk = installedChunks[chunkId]
      if (chunk !== 0) { // 说明chunk安装失败
        if (chunk) {
          chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'))
          installedChunks[chunkId] = undefined
        }
      }
    }
    head.appendChild(script)

    return promise
  }

  /**
   * @description 从异步加载的文件中安装模块
   * @param {*} chunkIds 正在加载的chunk的ID数组
   * @param {*} moreModules chunk中需要安装的模块数组
   * @param {*} executeModules 模块安装完需要执行的模块ID数组
   */
  window['webpackJsonp'] = function webpackJsonp(chunkIds, moreModules, executeModules) {
    let chunkId, moduleId, resolves = [], i = 0
    for (; i < chunkIds.length; i++) {
      chunkId = chunkIds[i]
      if (installedChunks[chunkId]) {
        resolves.push(installedChunks[chunkId][0])
      }
      installedChunks[chunkId] = 0
    }
    // 安装chunk中的module
    for (moduleId in object) {
      if (moreModules.hasOwnProperty(moduleId)) {
        modules[moduleId] = moreModules[moduleId]
      }
    }
    while (resolves.length) {
      resolves.shift()()
    }
  }
  // webpack中配置的publicPath，用于加载分割出去的异步模块
  __webpack_require__.p = ''
  // 加载第一个模块，即执行入口模块，整个应用程序开始执行
  return __webpack_require__(0)
})([
  function (module, exports, __webpack_require__) {
    // 1.异步加载show.js对应的chunk
    // 2.chunk加载完毕后加载chunk中的指定module
    // 3.执行module的导出
    __webpack_require__.e(0).then(__webpack_require__.bind(null, 1)).then(function (show) {
      show('hello webpack')
    })
  }
])