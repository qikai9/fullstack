# Vue → React 学习知识体系

> 面向熟悉 Vue 3 的前端开发者，系统学习 React 的核心概念、Hooks、渲染机制、状态管理和工程实践。

- 学习目标：从 Vue 迁移到 React，建立完整的 React 知识体系
- 学习方式：React 原理 + Vue 对比 + 实际业务场景 + 代码实践
- 核心思想：理解设计理念，不只是记忆 API

---

# 一、React 核心设计理念

## 1.1 React 的核心公式

React 的设计理念可以抽象为：

\[
UI = f(State, Props, Context)
\]

含义：

给定一组状态和属性，组件函数负责计算当前 UI 应该是什么样子。

| 概念 | 含义 | React API |
|---|---|---|
| UI | 用户界面 | JSX |
| f | 组件渲染函数 | Function Component |
| State | 组件内部状态 | useState、useReducer |
| Props | 父组件传递的数据 | props |
| Context | 跨层级共享的数据 | useContext |

示例：

```jsx
function Counter({ step }) {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(c => c + step)}>
      {count}
    </button>
  )
}
```

UI 由 count 和 step 共同决定。

## 1.2 React 的核心思想

### 声明式 UI

不需要手动操作 DOM，而是描述当前状态下 UI 应该是什么样子。

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  )
}
```

### 纯函数思想

React 希望组件渲染保持纯粹：

- 相同的 Props、State 和 Context，应产生相同的 UI 描述。
- 渲染期间不应该修改外部变量。
- 渲染期间不应该直接发起请求、注册事件或操作 DOM。
- 副作用应该放在事件处理函数或 Effect 中。

### 不可变性

React 推荐通过创建新对象、新数组来更新状态，而不是直接修改原对象。

错误：

```jsx
user.name = '张三'
setUser(user)
```

正确：

```jsx
setUser(prev => ({
  ...prev,
  name: '张三'
}))
```

不可变性有助于 React 通过引用比较识别变化，也有利于状态快照、调试和并发渲染。

---

# 二、Vue 与 React 的核心区别

## 2.1 整体对比

| 对比项 | Vue 3 | React |
|---|---|---|
| 设计理念 | 响应式驱动 | 状态驱动 UI |
| 组件定义 | SFC 单文件组件 | 函数组件 |
| 模板 | Template | JSX |
| 状态 | ref、reactive | useState、useReducer |
| 计算属性 | computed | useMemo（部分近似） |
| 监听变化 | watch、watchEffect | useEffect（部分近似） |
| 生命周期 | onMounted 等 | Effect 生命周期与组件生命周期机制 |
| DOM 引用 | ref | useRef |
| 组件通信 | props、emit | props、回调函数 |
| 插槽 | slot | props.children |
| 跨层级通信 | provide/inject | Context |
| 逻辑复用 | Composables | Custom Hooks |
| 全局状态 | Pinia、Vuex | Redux、Zustand、Context |
| 路由 | Vue Router | React Router |
| 表单绑定 | v-model | value + onChange |

## 2.2 Vue 响应式系统

Vue 的核心机制：

**读取时收集依赖，修改时通知依赖。**

核心概念：

- track：收集依赖。
- trigger：触发依赖。
- Proxy：拦截对象属性读取和修改。
- Ref：管理基本类型和引用类型的响应式值。
- Effect：响应式副作用。

示例：

```js
const state = reactive({
  count: 0,
  name: '张三'
})

effect(() => {
  console.log(state.count)
})

state.count++
// 触发依赖 count 的 effect
```

## 2.3 React 渲染机制

React 不会像 Vue 那样通过 Proxy 自动追踪普通变量读取。

React 主要通过状态更新机制调度组件重新渲染。

```jsx
function App() {
  const [count, setCount] = useState(0)

  return <Counter count={count} />
}
```

当 setCount 被调用：

1. React 接收到状态更新。
2. 调度相关组件更新。
3. 重新执行需要渲染的组件函数。
4. 生成新的 JSX。
5. Reconciliation 协调新旧 UI。
6. Commit 阶段提交必要的 DOM 更新。

注意：

React 重新执行组件函数，不代表整个 DOM 被重新创建。

Vue 也会重新执行需要更新的组件渲染函数，并通过编译优化减少不必要的工作。

两者核心区别是：

- Vue：通过响应式依赖追踪找到相关的渲染 effect。
- React：通过状态更新、Fiber 树和协调机制确定渲染工作。

---

# 三、React Hooks 知识体系

## 3.1 Hooks 分类

| 分类 | Hooks | 作用 |
|---|---|---|
| 状态管理 | useState | 局部状态 |
| 状态管理 | useReducer | 复杂状态更新 |
| 状态共享 | useContext | 跨层级共享 |
| 副作用 | useEffect | 同步外部系统 |
| 副作用 | useLayoutEffect | 绘制前处理布局 |
| 性能优化 | useMemo | 缓存计算结果 |
| 性能优化 | useCallback | 缓存函数引用 |
| 性能优化 | useTransition | 非紧急更新 |
| 性能优化 | useDeferredValue | 延迟非关键 UI 更新 |
| DOM 引用 | useRef | 保存 DOM 和可变引用 |
| DOM 引用 | useImperativeHandle | 暴露命令式方法 |
| 标识生成 | useId | 生成关联 ID |
| 外部状态 | useSyncExternalStore | 订阅外部 Store |
| 调试 | useDebugValue | 自定义 Hook 调试 |
| 异步交互 | useActionState | 管理 Action 状态 |
| 异步交互 | useOptimistic | 乐观更新 |
| Effect 逻辑 | useEffectEvent | Effect 中读取最新值 |
| 资源读取 | use | 读取 Promise 或 Context |

## 3.2 useState：管理局部状态

Vue 对照：ref、reactive。

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  )
}
```

核心特点：

- 状态属于组件。
- 调用 setState 请求重新渲染。
- 状态更新采用不可变方式。
- 每次渲染拥有自己的状态快照。
- 多次更新可能被批处理。

函数式更新：

```jsx
setCount(prev => prev + 1)
```

适用于需要基于最新状态计算下一状态的场景。

## 3.3 useEffect：副作用管理

Effect 的英文是作用、效果。

Side Effect 是副作用。

useEffect 是 React 用于与外部系统同步的 Hook。

典型副作用：

- HTTP 请求。
- 定时器。
- WebSocket。
- DOM 事件监听。
- 第三方图表实例。
- 浏览器 API 订阅。

基本结构：

```jsx
useEffect(() => {
  // 建立同步关系

  return () => {
    // 清理副作用
  }
}, [dependencies])
```

### 依赖数组的三种写法

不传依赖数组：

```jsx
useEffect(() => {
  console.log('每次提交后执行')
})
```

空依赖数组：

```jsx
useEffect(() => {
  console.log('挂载后执行')

  return () => {
    console.log('清理')
  }
}, [])
```

指定依赖：

```jsx
useEffect(() => {
  console.log('userId 变化后重新同步')
}, [userId])
```

注意：

- Effect 依赖必须完整。
- 依赖变化时，先清理旧 Effect，再执行新 Effect。
- 组件卸载时清理 Effect。
- 开发环境 StrictMode 可能额外执行 setup → cleanup → setup。
- 不要为了阻止 Effect 重复执行而随意删除依赖。

### useEffect 与 Vue 对比

| Vue | React |
|---|---|
| onMounted | useEffect(..., [])（部分近似） |
| onUnmounted | Effect cleanup |
| watch | useEffect（部分场景） |
| watchEffect | useEffect（部分场景） |

注意：useEffect 不是 watch + onMounted 的简单替代。

### 实际场景一：请求数据

```jsx
function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      try {
        const response = await fetch('/api/users', {
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error('请求失败')
        }

        const data = await response.json()
        setUsers(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadUsers()

    return () => controller.abort()
  }, [])

  if (loading) return <p>加载中...</p>

  return users.map(user => (
    <div key={user.id}>{user.name}</div>
  ))
}
```

生产项目还要考虑请求竞态、错误状态、缓存、重试等。

复杂服务端数据请求可以考虑 TanStack Query。

### 实际场景二：定时器

```jsx
function Countdown() {
  const [seconds, setSeconds] = useState(60)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return <div>{seconds}</div>
}
```

重点：

使用函数式更新避免闭包捕获旧状态。

真实订单倒计时应根据过期时间戳计算，而不是只依赖定时器执行次数。

### 实际场景三：窗口监听

```jsx
useEffect(() => {
  function handleResize() {
    console.log(window.innerWidth)
  }

  window.addEventListener('resize', handleResize)

  return () => {
    window.removeEventListener('resize', handleResize)
  }
}, [])
```

### 实际场景四：搜索防抖

```jsx
function SearchBox() {
  const [keyword, setKeyword] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(keyword)
    }, 500)

    return () => clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    if (!debounced) return

    console.log('执行搜索:', debounced)
  }, [debounced])

  return (
    <input
      value={keyword}
      onChange={e => setKeyword(e.target.value)}
    />
  )
}
```

### 实际场景五：WebSocket

```jsx
useEffect(() => {
  const socket = new WebSocket(url)

  socket.onmessage = event => {
    console.log(event.data)
  }

  return () => socket.close()
}, [url])
```

重点：连接建立、断开、重新连接和资源清理。

### 什么时候不应该使用 useEffect？

派生数据不应该通过 Effect 额外维护状态。

错误：

```jsx
const [total, setTotal] = useState(0)

useEffect(() => {
  setTotal(price * quantity)
}, [price, quantity])
```

正确：

```jsx
const total = price * quantity
```

如果计算成本高，再考虑 useMemo。

用户点击按钮提交订单，应放在事件处理函数中，而不是放在 Effect 中。

---

# 四、useRef：保存 DOM 和可变引用

Vue 对照：ref（部分近似）。

```jsx
function SearchInput() {
  const inputRef = useRef(null)

  function focusInput() {
    inputRef.current.focus()
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>聚焦</button>
    </>
  )
}
```

常见场景：

- 获取 DOM。
- 管理定时器 ID。
- 保存第三方实例。
- 保存跨渲染的可变值。
- 避免某些不需要触发 UI 更新的数据进入 State。

useState 与 useRef：

| 特性 | useState | useRef |
|---|---|---|
| 跨渲染保存 | 是 | 是 |
| 修改后触发渲染 | 是 | 否 |
| 保存 DOM | 不适合 | 适合 |
| 页面展示数据 | 适合 | 不适合 |

注意：不要使用 useRef 替代正常的 UI 状态。

---

# 五、useMemo、useCallback、React.memo

这是 React 性能优化最重要的组合。

## 5.1 useMemo：缓存计算结果

Vue 对照：computed（部分近似）。

```jsx
const filteredProducts = useMemo(() => {
  return products.filter(p => p.price > 100)
}, [products])
```

适用场景：

- 大量数据筛选。
- 复杂排序。
- 数据聚合。
- 稳定传递对象和数组引用。

依赖不变时，React 可以复用上次计算结果。

注意：

- 不是所有计算都需要 useMemo。
- 依赖数组必须完整。
- 它是性能优化，不是业务正确性的保障。

## 5.2 useCallback：缓存函数引用

```jsx
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])
```

React 组件每次重新渲染时，函数内部定义的普通函数都会重新创建。

```jsx
const fn1 = () => console.log('click')
const fn2 = () => console.log('click')

Object.is(fn1, fn2) // false
```

useCallback 在依赖不变时复用之前缓存的函数引用。

注意：

- 不是让 JavaScript 完全不创建新函数。
- 依赖变化时会返回新函数。
- 不能随意省略依赖，否则可能出现旧闭包。
- 普通按钮事件一般不需要使用 useCallback。

## 5.3 React.memo：缓存组件渲染

```jsx
const Child = memo(function Child({ onClick }) {
  console.log('Child render')

  return <button onClick={onClick}>点击</button>
})
```

React.memo 默认浅比较 Props。

当 Props 没有变化时，React 可以跳过因父组件更新导致的子组件重新渲染。

但以下情况仍可能重新渲染：

- 子组件自身 State 变化。
- 子组件消费的 Context 变化。
- Props 变化。
- 其他 React 更新机制要求执行组件。

## 5.4 三者的关系

| API | 优化对象 |
|---|---|
| useMemo | 计算结果 |
| useCallback | 函数引用 |
| React.memo | 组件渲染 |

典型组合：

```jsx
const filtered = useMemo(() => {
  return products.filter(p => p.price > 100)
}, [products])

const handleSelect = useCallback(id => {
  console.log(id)
}, [])

const ProductList = memo(function ProductList({
  products,
  onSelect
}) {
  return products.map(p => (
    <button
      key={p.id}
      onClick={() => onSelect(p.id)}
    >
      {p.name}
    </button>
  ))
})
```

## 5.5 为什么函数引用变化会影响子组件？

React 默认情况下，父组件重新渲染时，子组件也可能重新执行。

假设：

```jsx
function Parent() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    console.log('clicked')
  }

  return <Child onClick={handleClick} />
}
```

父组件重新渲染后，会创建新的 handleClick。

React.memo 比较：

```js
Object.is(prevProps.onClick, nextProps.onClick)
```

结果为 false，因此无法跳过子组件渲染。

改为：

```jsx
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])
```

函数引用保持稳定，memo 就有机会跳过子组件渲染。

关键结论：

函数引用变化不是直接触发渲染的原因，而是使 memo 的 Props 比较无法通过。

---

# 六、useReducer：复杂状态管理

## 6.1 为什么需要 useReducer？

当一个组件具有多个相关状态和复杂的更新逻辑时，useReducer 可以把更新规则集中管理。

```jsx
const [state, dispatch] = useReducer(reducer, initialState)
```

三个核心概念：

| 参数 | 含义 |
|---|---|
| state | 当前状态 |
| dispatch | 分发状态更新操作 |
| reducer | 根据 state 和 action 计算新状态 |

## 6.2 reducer 的定义

```jsx
function cartReducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, action.product]

    case 'remove':
      return state.filter(
        item => item.id !== action.id
      )

    case 'clear':
      return []

    default:
      return state
  }
}
```

为什么 reducer 有两个参数？

因为状态更新的核心公式是：

\[
NextState = Reducer(PreviousState, Action)
\]

- state：React 当前保存的旧状态。
- action：dispatch 传入的操作。
- 返回值：下一份状态。

React 在处理 dispatch 后调用 reducer。

示例：

```jsx
const [cart, dispatch] = useReducer(cartReducer, [])

dispatch({
  type: 'add',
  product: {
    id: '1',
    name: 'MacBook'
  }
})
```

概念上相当于：

```js
const nextState = cartReducer(
  currentState,
  {
    type: 'add',
    product: {
      id: '1',
      name: 'MacBook'
    }
  }
)
```

注意：这是原理上的等价表达。实际 React 内部还涉及更新队列和调度。

## 6.3 Reducer 工作流程

```text
用户点击
   ↓
dispatch(action)
   ↓
React 处理更新
   ↓
reducer(state, action)
   ↓
返回新的 state
   ↓
React 重新渲染
   ↓
页面更新
```

## 6.4 Reducer 注意事项

- 必须是纯函数。
- 不允许直接修改 state。
- 不应该在 reducer 中发送 HTTP 请求。
- 不应该在 reducer 中操作 DOM。
- 不应该在 reducer 中生成随机 ID。
- 未知 action 建议返回原 state 或通过开发期校验发现错误。

例如：

```jsx
case 'add':
  return [...state, action.product]
```

不能写：

```jsx
case 'add':
  state.push(action.product)
  return state
```

---

# 七、useContext：跨层级组件通信

## 7.1 解决什么问题？

解决 Props Drilling，即 Props 层层传递。

```text
App
 └── Layout
      └── Header
           └── UserInfo
```

如果 UserInfo 需要 App 中的 user，普通 Props 需要经过中间组件。

useContext 可以让后代组件直接读取上层 Provider 提供的值。

## 7.2 创建 Context

```jsx
import { createContext } from 'react'

const UserContext = createContext(null)
```

## 7.3 Provider 提供数据

```jsx
function App() {
  const [user, setUser] = useState({
    name: '张三'
  })

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Layout />
    </UserContext.Provider>
  )
}
```

## 7.4 后代组件读取

```jsx
function UserInfo() {
  const { user, setUser } = useContext(UserContext)

  return (
    <div>
      {user.name}
    </div>
  )
}
```

核心流程：

```text
createContext
    ↓
Provider 提供 value
    ↓
后代组件 useContext
    ↓
获取最近的 Provider value
```

Context 不会自动管理业务状态。

状态仍然需要通过 useState、useReducer 等方式管理。

## 7.5 如何传递多个 Context？

可以创建多个 Context：

```jsx
const UserContext = createContext(null)
const ThemeContext = createContext(null)
const CartContext = createContext(null)
```

嵌套 Provider：

```jsx
function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <CartProvider>
          <Dashboard />
        </CartProvider>
      </ThemeProvider>
    </UserProvider>
  )
}
```

子组件可以同时使用多个 Context：

```jsx
function Header() {
  const user = useContext(UserContext)
  const theme = useContext(ThemeContext)
  const cart = useContext(CartContext)

  return (
    <header>
      {user.name}
      {theme}
      {cart.length}
    </header>
  )
}
```

## 7.6 Context 更新机制

当 Provider 的 value 发生变化时，消费该 Context 的组件会收到更新。

注意：

如果使用：

```jsx
<Context.Provider value={{ cart, dispatch }}>
```

每次创建新对象都会产生新的引用。

即使某个组件只需要 dispatch，也可能因为消费了整个 Context 而重新渲染。

可以拆分：

```jsx
<CartStateContext.Provider value={cart}>
  <CartDispatchContext.Provider value={dispatch}>
    {children}
  </CartDispatchContext.Provider>
</CartStateContext.Provider>
```

useReducer 返回的 dispatch 引用是稳定的，因此购物车状态变化不会直接改变 Dispatch Context 的 value。

---

# 八、useContext + useReducer：构建轻量级状态管理

这是 React 中非常重要的组合。

## 8.1 分工

| API | 负责什么 |
|---|---|
| useReducer | 管理状态和状态更新规则 |
| useContext | 跨组件传递状态和 dispatch |
| 自定义 Hooks | 简化状态读取与操作 |

## 8.2 创建 CartContext

```jsx
import {
  createContext,
  useContext,
  useReducer
} from 'react'

const CartStateContext = createContext(null)
const CartDispatchContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, action.product]

    case 'remove':
      return state.filter(
        item => item.id !== action.id
      )

    case 'clear':
      return []

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(
    cartReducer,
    []
  )

  return (
    <CartStateContext.Provider value={cart}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  )
}
```

## 8.3 自定义 Hooks

```jsx
export function useCart() {
  const cart = useContext(CartStateContext)

  if (cart === null) {
    throw new Error('请在 CartProvider 内使用')
  }

  return cart
}

export function useCartDispatch() {
  const dispatch = useContext(CartDispatchContext)

  if (dispatch === null) {
    throw new Error('请在 CartProvider 内使用')
  }

  return dispatch
}
```

注意：

useCart 和 useCartDispatch 不是 React 内置 API。

它们是开发者自己定义的 Custom Hooks，本质上封装了 useContext。

## 8.4 使用 Provider

```jsx
function App() {
  return (
    <CartProvider>
      <Header />
      <ProductList />
      <CartPage />
    </CartProvider>
  )
}
```

## 8.5 子组件读取状态

```jsx
function Header() {
  const cart = useCart()

  return (
    <header>
      购物车：{cart.length}
    </header>
  )
}
```

## 8.6 子组件修改状态

```jsx
function ProductCard({ product }) {
  const dispatch = useCartDispatch()

  return (
    <button onClick={() => {
      dispatch({
        type: 'add',
        product
      })
    }}>
      添加商品
    </button>
  )
}
```

完整数据流：

```text
CartProvider
    ↓
useReducer
    ↓
生成 cart 和 dispatch
    ↓
两个 Context Provider
    ↓
子组件通过自定义 Hook 读取
    ↓
dispatch(action)
    ↓
React 调用 reducer
    ↓
生成新 state
    ↓
Context value 更新
    ↓
消费者重新渲染
```

## 8.7 与 Vue Pinia 对比

| Vue / Pinia | React |
|---|---|
| provide | Context.Provider |
| inject | useContext |
| Pinia state | useReducer 的 state |
| Pinia action | dispatch + reducer |
| Composable | Custom Hook |

两者不是完全等价。

Pinia 是完整的 Store 方案，useReducer 本身只是组件级状态管理 API。

---

# 九、React 为什么默认采用组件函数重新执行的模型？

核心设计理念：

\[
UI = f(State, Props, Context)
\]

React 将组件看作计算 UI 的函数。

## 9.1 React 的工作方式

```text
State 更新
   ↓
调度组件更新
   ↓
重新执行相关组件函数
   ↓
生成新的 JSX
   ↓
Reconciliation
   ↓
Commit
   ↓
更新必要 DOM
```

React 不会自动像 Vue Proxy 那样追踪普通 JavaScript 变量的读取。

## 9.2 Vue 的工作方式

```text
读取响应式数据
   ↓
track 收集依赖
   ↓
修改响应式数据
   ↓
trigger 触发依赖
   ↓
执行相关渲染 effect
   ↓
VDOM Patch
   ↓
更新 DOM
```

## 9.3 两者设计差异

| 维度 | React | Vue |
|---|---|---|
| 核心模型 | 状态快照 | 响应式依赖 |
| 数据更新 | setState | ref / reactive 修改 |
| 更新定位 | Fiber 更新与协调 | track / trigger |
| 渲染执行 | 重新执行相关组件 | 执行相关组件渲染 effect |
| 优化机制 | memo、Compiler | 依赖追踪、Patch Flags |
| 数据模型 | 不可变更新 | 响应式代理 |

React 并不是每次都重新执行整个应用。

它可以通过以下方式减少工作：

- React.memo。
- useMemo。
- useCallback。
- 状态下沉。
- 组件拆分。
- React Compiler。

## 9.4 状态下沉

不推荐：

```jsx
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Counter count={count} setCount={setCount} />
      <ExpensiveChart />
    </>
  )
}
```

推荐：

```jsx
function App() {
  return (
    <>
      <Counter />
      <ExpensiveChart />
    </>
  )
}

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  )
}
```

状态只属于 Counter，就把状态放到 Counter 中。

这往往比到处使用 memo 更有效。

---

# 十、JSON Server：模拟后端 API

## 10.1 什么是 JSON Server？

JSON Server 是一个基于 Node.js 的 Mock REST API 工具。

只需要一个 JSON 文件，就可以自动生成基础的 RESTful API。

例如：

```json
{
  "users": [
    {
      "id": "1",
      "name": "张三",
      "age": 25
    },
    {
      "id": "2",
      "name": "李四",
      "age": 28
    }
  ]
}
```

启动：

```bash
npx json-server --port 3001 db.json
```

它可以提供：

| 方法 | 地址 | 作用 |
|---|---|---|
| GET | /users | 查询所有用户 |
| GET | /users/1 | 查询指定用户 |
| POST | /users | 新增用户 |
| PUT | /users/1 | 替换用户 |
| PATCH | /users/1 | 修改部分字段 |
| DELETE | /users/1 | 删除用户 |

注意：不同 JSON Server 版本的命令参数和行为可能有所区别，当前 v1 仍属于 beta，使用时以对应版本文档为准。

## 10.2 底层原理

```text
React 前端
    ↓
fetch / Axios
    ↓
HTTP 请求
    ↓
Node.js / JSON Server
    ↓
路由匹配
    ↓
读取或修改 db.json
    ↓
返回 JSON 响应
    ↓
React 更新 State
    ↓
页面重新渲染
```

## 10.3 localhost 和端口

例如：

```text
http://localhost:5173
```

表示 Vite 前端开发服务器。

```text
http://localhost:3001
```

表示 JSON Server 模拟后端。

它们是两个独立运行的进程。

localhost 表示本机，端口用于区分不同服务。

## 10.4 使用 Vite 代理解决跨域

```js
// vite.config.js

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
```

React 中：

```js
fetch('/api/users')
```

由 Vite 转发到 JSON Server。

---

# 十一、其他重要 Hooks

## 11.1 useTransition

用于标记非紧急状态更新。

```jsx
const [isPending, startTransition] = useTransition()

function handleChange(value) {
  setInput(value)

  startTransition(() => {
    setKeyword(value)
  })
}
```

场景：

- 大型列表筛选。
- 复杂表格更新。
- 页面切换。
- 复杂 UI 更新。

注意：

它不让计算本身变快，而是允许 React 对更新进行优先级调度。

## 11.2 useDeferredValue

延迟非关键 UI 的更新。

```jsx
const deferredKeyword = useDeferredValue(keyword)
```

场景：

- 搜索结果。
- 复杂列表。
- 大型数据预览。

注意：

它不是固定时间的防抖工具。

## 11.3 useActionState

管理 Action 结果和 pending 状态。

场景：

- 登录表单。
- 用户信息提交。
- 订单提交。

## 11.4 useOptimistic

乐观更新。

场景：

- 点赞。
- 评论。
- 消息发送。
- 购物车交互。

核心思想：

先更新 UI，再等待服务器确认。

## 11.5 useLayoutEffect

在浏览器绘制前执行布局相关操作。

场景：

- Tooltip 定位。
- DOM 尺寸测量。
- 滚动位置调整。

注意：可能阻塞浏览器绘制，不要随意替代 useEffect。

## 11.6 useSyncExternalStore

订阅 React 外部状态系统。

场景：

- 第三方 Store。
- 浏览器外部状态。
- 自定义订阅系统。

## 11.7 useEffectEvent

React 19.2 引入的 API。

用于 Effect 内部读取最新的非响应式值。

适合某些不应该触发 Effect 重新同步的逻辑。

## 11.8 use

读取 Promise 或 Context 的资源 API。

可以与 Suspense 等机制配合。

---

# 十二、Hooks 使用规则

## 12.1 只能在组件或自定义 Hook 顶层调用

错误：

```jsx
if (enabled) {
  const [count, setCount] = useState(0)
}
```

正确：

```jsx
const [count, setCount] = useState(0)

if (!enabled) {
  return null
}
```

## 12.2 不要直接修改状态

错误：

```jsx
user.name = '李四'
setUser(user)
```

正确：

```jsx
setUser(prev => ({
  ...prev,
  name: '李四'
}))
```

## 12.3 不要滥用 useEffect

能直接计算的数据不要额外维护一份状态。

## 12.4 不要过早使用性能优化 API

不是所有函数都需要 useCallback。

不是所有计算都需要 useMemo。

不是所有组件都需要 memo。

先定位实际性能问题，再进行优化。

## 12.5 自定义 Hooks 共享逻辑，不自动共享状态

例如：

```jsx
function useCounter() {
  const [count, setCount] = useState(0)

  return { count, setCount }
}
```

两个组件分别调用 useCounter，会获得各自独立的状态。

如果需要共享状态，需要 Context、外部 Store 等机制。

---

# 十三、React 与 Vue 的重要思维转变

从 Vue 转向 React，最重要的不是 API 对应关系，而是思维模型。

| Vue 习惯 | React 新认知 |
|---|---|
| ref.value 直接修改 | 使用 setState 更新 |
| computed 自动追踪 | useMemo 显式声明依赖 |
| watch 监听数据 | Effect 负责外部同步 |
| reactive 自动响应 | State 快照与不可变更新 |
| emit 事件 | 回调函数作为 Props |
| provide/inject | Context |
| Composable | Custom Hook |
| Pinia Store | Context + Reducer / Zustand / Redux |
| 模板指令 | JSX + JavaScript 表达式 |
| 组件更新自动追踪 | 理解组件重新渲染和 Fiber 协调 |

---

# 十四、推荐学习路线

## 第一阶段：React 基础

- JSX。
- 函数组件。
- Props。
- Children。
- 事件处理。
- 条件渲染。
- 列表渲染。
- useState。
- 不可变性。

目标：能够独立开发简单 React 页面。

## 第二阶段：Hooks 与副作用

- useEffect。
- useRef。
- useMemo。
- useCallback。
- 自定义 Hooks。
- 闭包。
- 依赖数组。
- cleanup。
- 异步请求管理。

目标：能够正确管理真实业务中的副作用。

## 第三阶段：状态管理与组件通信

- useContext。
- useReducer。
- Context + Reducer。
- Zustand。
- Redux Toolkit。
- 状态提升与状态下沉。

目标：能够设计复杂业务的状态结构。

## 第四阶段：性能优化

- React.memo。
- useMemo。
- useCallback。
- React Profiler。
- React Compiler。
- 虚拟列表。
- 状态拆分。
- 并发渲染。

目标：能够分析和解决不必要的组件重新渲染。

## 第五阶段：React 底层原理

- Virtual DOM。
- Fiber。
- Reconciliation。
- Render 阶段。
- Commit 阶段。
- Hooks 内部原理。
- 闭包与状态快照。
- Concurrent Rendering。
- Suspense。

目标：理解 React 的设计机制，而不是只会使用 API。

## 第六阶段：工程化和生态

- Vite。
- TypeScript。
- React Router。
- TanStack Query。
- Ant Design。
- Tailwind CSS。
- Jest / Vitest。
- React Testing Library。
- Next.js。
- SSR / SSG。

目标：具备独立开发完整 React 项目的能力。

---

# 十五、实战项目规划

建议使用 React + TypeScript + Vite 开发一个完整后台管理系统。

## 项目一：Todo List

练习：

- useState。
- useReducer。
- useEffect。
- 列表渲染。
- 事件处理。

## 项目二：用户管理系统

练习：

- React Router。
- 表单。
- 数据请求。
- 搜索与分页。
- React Query。
- Context。

## 项目三：购物车系统

练习：

- useReducer。
- useContext。
- 自定义 Hooks。
- 状态共享。
- 复杂状态转换。

## 项目四：数据可视化后台

练习：

- ECharts。
- useRef。
- useEffect。
- useMemo。
- React.memo。
- 性能优化。

## 项目五：完整企业级管理系统

练习：

- 权限管理。
- 多模块组件设计。
- 全局状态。
- 请求缓存。
- 路由守卫。
- 表格与表单。
- 单元测试。
- 工程化部署。

---

# 十六、核心知识点速查

| 问题 | 核心答案 |
|---|---|
| React 的核心公式是什么？ | UI = f(State, Props, Context) |
| React 为什么重新渲染组件？ | 状态或其他相关更新驱动组件重新计算 UI |
| React 状态为什么不可变？ | 有利于引用比较、快照和更新判断 |
| useEffect 做什么？ | 与外部系统同步 |
| useRef 和 useState 的区别？ | 修改 ref 不触发重新渲染 |
| useMemo 和 memo 的区别？ | 缓存计算结果 vs 优化组件渲染 |
| useCallback 做什么？ | 缓存函数引用 |
| useReducer 做什么？ | 集中管理复杂状态转换 |
| reducer 参数从哪里来？ | React 提供旧 state，dispatch 提供 action |
| useContext 做什么？ | 跨层级读取 Provider 数据 |
| useCart 是什么？ | 开发者自己封装的自定义 Hook |
| Context + Reducer 做什么？ | 共享状态与统一更新 |
| 为什么函数引用变化影响 memo？ | memo 默认浅比较 Props |
| React 为什么不用 Proxy？ | 采用状态快照和显式更新的设计模型 |
| Vue 为什么可以精准追踪？ | track 收集依赖，trigger 触发依赖 |
| JSON Server 是什么？ | 本地 Mock REST API 服务 |

---

# 十七、推荐学习资源

1. React 官方文档：https://react.dev/
2. React 中文文档：https://zh-hans.react.dev/
3. React Hooks API：https://react.dev/reference/react/hooks
4. React 学习教程：https://react.dev/learn
5. React Thinking in React：https://react.dev/learn/thinking-in-react
6. React TypeScript：https://react.dev/learn/typescript
7. TanStack Query：https://tanstack.com/query/latest

---

# 十八、长期学习记录模板

以后学习一个新知识点，可以按照以下结构持续补充：

## 知识点名称

### 1. 概念

这个知识点解决什么问题？

### 2. 设计目的

为什么 React 需要它？

### 3. 核心原理

底层是如何工作的？

### 4. Vue 对比

Vue 中有什么类似的概念？

### 5. 基础用法

```jsx
// 代码示例
```

### 6. 实际业务场景

在后台管理系统、表单、列表、数据可视化等场景中如何使用？

### 7. 常见错误

容易出现什么问题？

### 8. 注意事项

性能、依赖、闭包、状态管理等方面需要注意什么？

### 9. 总结

用一句话总结核心思想。

---

# 最终学习目标

从 Vue 开发者转向 React，不应该只满足于掌握 JSX 和 Hooks。

真正需要建立的能力是：

1. 理解 React 的声明式 UI 设计。
2. 理解状态快照和不可变性。
3. 理解组件渲染与 Fiber 协调机制。
4. 掌握 Hooks 和副作用管理。
5. 能够设计合理的组件通信与状态管理。
6. 能够分析和优化 React 性能。
7. 能够独立开发完整的 React + TypeScript 项目。

**学习原则：先理解设计理念，再掌握 API；先解决真实业务问题，再深入源码原理。**
