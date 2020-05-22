;(function (modules) { // modules即为存放所有模块的数组，数组的每一项都是一个函数，执行这个函数可以对外暴露模块，也可以引用其他模块
  // 缓存已经安装过的模块
  var installedModules = {}
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
  // webpack中配置的publicPath，用于加载分割出去的异步模块
  __webpack_require__.p = ''
  // 加载第一个模块，即执行入口模块，整个应用程序开始执行
  return __webpack_require__(0)
})([ // 所有模块都存放在数组中，模块在数组中的索引即为模块ID
  function (module, exports, __webpack_require__) {
    var show = __webpack_require__(1)
    show('hello webpack')
  },
  function name(module, exports) {
    function show(msg) {
      console.log(msg)
    }
    module.exports = show
  }
])
