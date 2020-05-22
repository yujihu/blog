Refs提供了一种方式，允许我们访问DOM节点或在render方法中创建的React组件。
### 创建Refs
使用`React.createRef()`创建Refs，并通过元素的ref属性附加到元素上。在构造组件的时候，通常会将Refs分配给组件实例的某个属性，以便可以在整个组件中引用它们。
```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }
  render() {
    return <div ref={this.myRef} />;
  }
}
```
### 访问Refs
当ref被传递给render中的元素时，可以通过ref的current属性访问节点的引用。
```javascript
const node = this.myRef.current;
```
ref的值根据节点的类型会有所不同：
- 当节点是HTML元素时，ref接收底层DOM元素作为其current属性；
- 当节点时class组件时，ref接收组件的挂载实例作为其current属性；
- **不能在函数组件上使用ref，因为它根本就没有实例。**

Refs与函数组件：

默认情况下，我们不能在函数组件上使用ref属性，因为它们没有实例。如果要在函数组件上使用ref，我们可以使用`Refs转发`，将其指向一个DOM元素或class组件。

### 回调Refs
传递一个函数作为元素的ref属性，这个函数接收HTML DOM元素或React Class组件实例作为参数。
```javascript
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.setTextInputRef = this.setTextInputRef.bind(this);
  }

  setTextInputRef(element) {
    this.textInput = element;
  }

  render() {
    return (
      <div>
        <input
          type="text"
          ref={this.setTextInputRef}
        />
      </div>
    )
  }
}
```
可以在组件间传递回调形式的Refs，就像我们也可以传递通过`React.createRef()`创建的对象一样：
```javascript
function CustomTextInput(props) {
  return (
    <div>
      <input ref={props.inputRef} />
    </div>
  );
}

class Parent extends React.Component {
  render() {
    return (
      <CustomTextInput
        inputRef={el => this.inputElement = el}
      />
    );
  }
}
```
在上面例子中，Parent中的`this.inputElement`会被设置为与 CustomTextInput 中的 input 元素相对应的 DOM 节点。

### 转发Refs
Refs转发是将ref自动地通过组件传递到某个子组件的技巧。子组件通过`React.forwardRef`来获取传递给它的ref，然后转发给它内部的DOM元素或组件实例。
```javascript
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

// 你可以直接获取 DOM button 的 ref：
const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>;
```
上面示例发生情况的逐步解释为：
- 1.我们通过调用 `React.createRef` 创建了一个 React ref 并将其赋值给 ref 变量。
- 2.我们通过指定 ref 为 JSX 属性，将其向下传递给 `<FancyButton ref={ref}>`。
- 3.React 传递 ref 给 forwardRef 内函数 (props, ref) => ...，作为其第二个参数。
- 4.我们向下转发该 ref 参数到 `<button ref={ref}>`，将其指定为 JSX 属性。
- 5.当 ref 挂载完成，ref.current 将指向 `<button>` DOM 节点。

**注意：第二个参数 ref 只在使用 React.forwardRef 定义组件时存在。常规函数和 class 组件不接收 ref 参数，且 props 中也不存在 ref。**

### useRef
返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。返回的 ref 对象在组件的整个生命周期内保持不变。
```javascript
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // `current` 指向已挂载到 DOM 上的文本输入元素
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

### useImperativeHandle
可以在我们使用Refs时自定义暴露给父组件的值，与`React.forwardRef`搭配使用。
```javascript
const FancyInput = React.forwardRef((props, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input ref={inputRef} type="text" />;
});
```
渲染 `<FancyInput ref={inputRef} />` 的父组件可以调用 `inputRef.current.focus()`。

### 非受控组件
通常情况下，我们使用`受控组件`来处理表单数据。在一个`受控组件`中，表单数据是由React组件来管理的。而`非受控组件`的数据是由DOM节点来控制的。

在使用`非受控组件`时，我们可以使用ref来从DOM节点中获取表单数据：
```javascript
class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.input = React.createRef();
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.input.current.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" ref={this.input} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
```