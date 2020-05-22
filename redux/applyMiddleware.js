import compose from './compose'

export default function applyMiddleware (middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    // 在构造middleware的过程中禁止dispatch action
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
        'Other middleware would not be applied to this dispatch.'
      )
    }
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)
    return {
      ...store,
      dispatch
    }
  }
}