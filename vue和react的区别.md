### Vue使用的是web开发者更熟悉的模板与特性
Vue的API与传统web开发者熟悉的模板契合度更高，比如Vue的单文件组件是以Template+JS+CSS的组合模式呈现。它跟web现有的HTML、JS、CSS能更好地配合。

### React的特色在于函数式编程和丰富的技术选型
Vue更容易被前端工程师接受，或者说更容易上手，这是一个直观的感受；React则更容易吸引才函数式编程上持续走下去的开发者。

### 使用习惯与思维方式方面
对于没有任何Vue和React开发经验的基础web开发者来说，Vue会更加友好，更符合他们的思维模式。

对于拥有函数式编程背景的开发者以及一些并不是以web为主要开发平台的开发人员而言，React更容易被接受。

### Vue与React的最大区别在于数据的reactivity，即响应式系统方面

Vue提供响应式的数据，当数据发生变化时，界面就会自动更新；而React则需要手动调用setState方法。

二者的分别可以被称为Push-based和Pull-based。所谓Push-based就是说改变数据后，数据本身会把这个改动推送出去，告知渲染系统自动进行渲染；而Pull-based中，用户需要给系统一个明确的信号告知现在需要重新渲染了，系统才会重新渲染。二者并没有绝对的优劣势之分，更多的是思维方式和开发模式的不同。

二者也不是完全互斥的，在React里面，我们可以使用像MobX的第三方库实现Push-based系统；同时在Vue中，可以通过一些手段，比如把数据freeze起来，让数据不再具有响应式的特性，或者手动调用组件的更新方法来实现Pull-based。

### 参考
[Vue作者尤雨溪：以匠人的态度不断打磨完善Vue](https://zhuanlan.zhihu.com/p/108899766)
