import { VNodeFlags, ChildrenFlags } from './flags'
import { createTextNode } from './h'

export function render (vnode, container) {
  const prevVNode = container.vnode
  if (prevVNode) { // 旧的vnode存在
    if (vnode) { // 新的vnode存在
      patch(prevVNode, vnode, container)
      container.vnode = vnode
    } else { // 新的vnode不存在
      container.removeChild(prevVNode.el) // 移除旧的vnode
      container.vnode = null
    }
  } else { // 旧的vnode不存在
    if (vnode) { // 新的vnode存在
      mount(vnode, container)
    }
  }
}

function mount (vnode, container, isSVG) {
  const { flags } = vnode
  if (flags & VNodeFlags.ELEMENT) {
    // 挂载普通标签
    mountElement(vnode, container, isSVG)
  } else if (flags & VNodeFlags.COMPONENT) {
    // 挂载组件
    mountComponent(vnode, container, isSVG)
  } else if (flags & VNodeFlags.TEXT) {
    // 挂载文本节点
    mountText(vnode, container)
  } else if (flags & VNodeFlags.FRAGMENT) {
    mountFragment(vnode, container, isSVG)
  } else if (flags & VNodeFlags.PORTAL) {
    mountPortal(vnode, container)
  }
}

const domPropsRE = /\[A-Z]^(?:value|checked|selected|muted)$/
/**
 * @description 挂载DOM元素
 * @date 12/09/2020
 * @param {*} vnode 虚拟节点
 * @param {*} container 容器
 * @param {*} isSVG 是否是SVG元素
 */
function mountElement (vnode, container, isSVG) {
  // 创建dom节点， 并处理svg元素
  isSVG = isSVG || vnode.flags & VNodeFlags.ELEMENT_SVG
  const el = isSVG ? document.createElementNS('http://www.w3.org/2000/svg', vnode.flags) : document.createElement(vnode.tag)
  // 引用真实dom节点
  vnode.el = el
  // 将VNodeData应用到真实dom上
  const data = vnode.data
  if (data) {
    for (const key in data) {
      switch (key) {
        case 'style':
          for (const k in data.style) {
            el.style[key] = data.style[k]
          }
          break
        case 'class':
          el.className = data[key]
          break
        default:
          if (key[0] === 'o' && key[1] === 'n') {
            el.addEventListener(key.slice(2), data[key])
          } else if (domPropsRE.test(key)) {
            el[key] = data[key]
          } else {
            el.setAttribute(key, data[key])
          }
          break
      }
    }
  }
  // 挂载子节点
  const { childFlags, children } = vnode
  if (childFlags !== ChildrenFlags.NO_CHILDREN) {
    if (childFlags & ChildrenFlags.SINGLE_VNODE) {
      mount(children, el, isSVG)
    } else if (childFlags & ChildrenFlags.KEYED_VNODES) {
      for (let i = 0; i < children.length; i++) {
        mount(children[i], el, isSVG)
      }
    }
  }
  container.appendChild(el)
}
/**
 * @description 挂载文本元素
 * @date 12/09/2020
 * @param {*} vnode 虚拟节点
 * @param {*} container 容器
 */
function mountText (vnode, container) {
  const el = document.createTextNode(vnode.children)
  vnode.el = el
  container.appendChild(el)
}

function mountFragment (vnode, container, isSVG) {
  const { childFlags, children } = vnode
  if (childFlags & ChildrenFlags.SINGLE_VNODE) {
    mount(children, container, isSVG)
    vnode.el = children.el
  } else if (childFlags & ChildrenFlags.KEYED_VNODES) {
    for (let i = 0; i < children.length; i++) {
      mount(children[i], container, isSVG)
    }
    vnode.el = children[0].el
  } else {
    // 如果没有子节点，则创建一个空白的文本节点进行占位
    const placeholder = createTextNode('')
    mountText(placeholder, container)
    vnode.el = placeholder.el
  }
}

function mountPortal (vnode, container) {
  const { tag, childFlags, children } = vnode
  // 挂载点
  const target = typeof tag === 'string' ? document.querySelector(tag) : tag
  if (childFlags & ChildrenFlags.SINGLE_VNODE) {
    mount(children, target)
  } else if (childFlags & ChildrenFlags.KEYED_VNODES) {
    for (let i = 0; i < children.length; i++) {
      mount(children[i], target)
    }
  }
  // 占位的空白文本节点
  const placeholder = createTextNode('')
  mountText(placeholder, container)
  vnode.el = placeholder.el
}

function mountComponent (vnode, container, isSVG) {
  if (vnode.flags & VNodeFlags.COMPONENT_STATEFUL) {
    mountStatefulComponent(vnode, container, isSVG)
  } else {
    mountFunctionalComponent(vnode, container, isSVG)
  }
}

function mountStatefulComponent (vnode, container, isSVG) {
  // 创建组件实例
  const instance = new vnode.tag() // eslint-disable-line
  // 获取组件产出的VNode
  instance.$vnode = instance.render()
  // 挂载组件产出的VNode
  mount(instance.$vnode, container, isSVG)
  // 让组组件实例的$el属性和vnode的el属性引用组件的根DOM元素
  vnode.el = instance.$el = instance.$vnode.el
}

function mountFunctionalComponent (vnode, container, isSVG) {
  // 获取组建产出的VNode
  const $vnode = vnode.tag()
  // 挂载组建产出的VNode
  mount($vnode, container, isSVG)
  // vnode的el属性引用组建的根元素
  vnode.el = $vnode.el
}

function patch (prevVNode, vnode, container) {

}
