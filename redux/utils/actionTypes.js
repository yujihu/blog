const randomString = () => {
  Math.random().toString(36).substring(7).split('').join('.')
}
export default {
  INIT: `@@redux/INIT${/* #__PURE__ */ randomString()}`,
  REPLACE: `@@redux/REPLACE${/* #__PURE__ */ randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
}