import { VNodeFlags, ChildrenFlags } from './flags'

export const Fragment = Symbol('fragment')
export const Portal = Symbol('portal')

export function h (tag, data = null, children = null) {
  /* 在VNode创建时确定其类型 start */
  let flags = null
  if (typeof tag === 'string') {
    flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML
  } else if (tag === Fragment) {
    flags = VNodeFlags.FRAGMENT
  } else if (tag === Portal) {
    flags = VNodeFlags.PORTAL
    tag = data && data.target
  } else {
    if (tag !== null && typeof tag === 'object') { // Vue2的对象式组件
      flags = tag.functional ? VNodeFlags.COMPONENT_FUNCTIONAL : VNodeFlags.COMPONENT_STATEFUL
    } else {
      flags = tag.prototype && tag.prototype.render ? VNodeFlags.COMPONENT_STATEFUL : VNodeFlags.COMPONENT_FUNCTIONAL
    }
  }
  /* 在VNode创建时确定其类型 end */
  /* 在VNode创建时确定其children的类型 start */
  let childFlags = null
  if (Array.isArray(children)) {
    const { length } = children
    if (length === 0) {
      childFlags = ChildrenFlags.NO_CHILDREN
      children = null
    } else if (length === 1) {
      childFlags = ChildrenFlags.SINGLE_VNODE
      children = children[0]
    } else {
      childFlags = ChildrenFlags.KEYED_VNODES
      children = normalizeVNodes(children) // 为children添加key
    }
  } else if (!children) {
    childFlags = ChildrenFlags.NO_CHILDREN
  } else if (children._isVNode) {
    childFlags = ChildrenFlags.SINGLE_VNODE
  } else { // 作为文本节点处理
    childFlags = ChildrenFlags.SINGLE_VNODE
    children = createTextNode(children + '')
  }
  /* 在VNode创建时确定其children的类型 start */
  return {
    _isVNode: true,
    flags,
    tag,
    data,
    childFlags,
    children,
    el: null
  }
}
/**
 * @description 如果子节点没有key就给它添加
 * @date 10/09/2020
 * @param {*} children
 * @return {*} 包含key的子节点数组
 */
function normalizeVNodes (children) {
  const newChildren = []
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (!child.key) {
      child.key = '|' + i
    }
    newChildren.push(child)
  }
  return newChildren
}
/**
 * @description 创建文本VNode
 * @date 10/09/2020
 * @param {*} text
 * @return {*} 文本VNode
 */
function createTextNode (text) {
  return {
    _isVNode: true,
    flags: VNodeFlags.TEXT,
    tag: null,
    data: null,
    children: text,
    childFlags: ChildrenFlags.NO_CHILDREN,
    el: null
  }
}
