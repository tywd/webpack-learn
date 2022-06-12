# 什么是Loader
一个loader可以看做是一个node模块，也可以看做一个loader就是一个函数 (loader会导出一个函数)，众所周知webpack只能识别js文件，loader在webpack中担任的角色就是翻译工作，它可以让其它非js的资源（source）可以在webpack中通过loader顺利加载。
Loader的方式

- 单一职责，一个loader只做一件事
- 调用方式，loader是从右向左执行，链式调用
- 统一原则，loader输入和输出都字符串

当链式调用多个 loader 的时候，请记住它们是反方向执行的。取决于数组写法格式，**从右向左或者从下向上执行**。

- **最后的 loader 最早调用**，将会传入原始资源（raw resource）内容。
- **第一个 loader 最后调用**，期望值是传出 JavaScript 和 source map（可选）。
- **中间的 loader 执行时，会传入前一个 loader 的结果**。

在下例中，foo-loader 被传入原始资源，bar-loader 将接收 foo-loader 的产出，返回最终转化后的模块和一个 source map（可选）

```js
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.js/,
        use: ['bar-loader', 'foo-loader'],
      },
    ],
  },
};
```

# 编写自定义loader
[webpack 官方编写介绍](https://webpack.docschina.org/contribute/writing-a-loader/)
### 编写准则
编写自定义的 loader 时，官方提供了一套用法准则（Guidelines），在编写的时候应该按照这套准则来使 loader 标准化：
- 简单易用。(simple)
- 使用链式传递。(chaining)（由于 loader 是可以被链式调用的，所以请保证每一个 loader 的单一职责）

> Tip
>
> loader 可以被链式调用意味着不一定要输出 JavaScript。只要下一个 loader 可以处理这个输出，这个 loader 就可以返回任意类型的模块。

- 模块化的输出(modular)。
- 确保无状态。(stateless)（不要让 loader 的转化中保留之前的状态，每次运行都应该独立于其他编译模块以及相同模块之前的编译结果）
- 充分使用官方提供的工具库 loader utilities 。
- 记录 loader 的依赖。
- 解析模块依赖关系。
- 提取 通用代码 。
- 避免 绝对路径 。
- 使用 peer dependencies(同等依赖)。

如果你的 loader 简单包裹另外一个包，你应该把这个包作为一个 peerDependency 引入。这种方式允许应用程序开发者在必要情况下，在 package.json 中指定所需的确定版本。

例如，sass-loader 指定 node-sass 作为同等依赖，引用如下：
```js
{
  "peerDependencies": {
    "node-sass": "^4.0.0"
  }
}
```

[详见webpack 编写loader 用法准则](https://webpack.docschina.org/contribute/writing-a-loader/#guidelines)
### loader 的四种类型
我们基本可以把常见的 loader 分为四种：
- 同步 loader\
无论是 return 还是 this.callback 都可以同步地返回转换后的 content 值
- 异步 loader\
对于异步 loader，使用 this.async 来获取 callback 函数
- "Raw" Loader\
默认情况下，资源文件会被转化为 UTF-8 字符串，然后传给 loader。通过设置 raw 为 true，loader 可以接收原始的 Buffer。每一个 loader 都可以用 String 或者 Buffer 的形式传递它的处理结果。complier 将会把它们在 loader 之间相互转换。
- Pitching loader\

[webpack loader 4种类型](https://webpack.docschina.org/api/loaders/#examples)

### 开始编写loader
Loader 开发思路，编写Loader时要遵循单一职责原则，每个Loader只做一种转换工作
- 通过 module.exports 导出一个 函数
- 函数第一默认参数为 source(源文件内容)
- 在函数体中处理资源 (可引入第三方模块扩展功能)
- 通过 return 返回最终转换结果 (字符串形式)

参考 https://github.com/tywd/webpack-learn/tree/master/custom-loader 下的的构建

在 https://github.com/tywd/webpack-learn 查看如何使用
#### 官方一个基础的 loader实现，并使用了 jest 对 loader 进行测试
具体代码参考 [custom-loader/basic-loader.js](https://github.com/tywd/webpack-learn/tree/master/custom-loader/basic-loader.js)  方法
```js
export default function basicLoader(source) {
    const options = this.getOptions(); // 获取传进来的options选项

    source = source.replace(/\[name\]/g, options.name); // 替换 .txt 里的 [name] 为传进来的 options.name

    return `export default ${JSON.stringify(source)}`; // 以字符串的形式输出
}
```
#### 一个加入特定的注释的 loader
具体代码参考 [custom-loader/company-loader.js](https://github.com/tywd/webpack-learn/tree/master/custom-loader/company-loader.js) 
```js
// 功能是在编译出的代码中加上 以下格式 的公司年份信息，并且我们链式调用他们
/** 公司@年份 */
module.exports = function (source) {
    // 获取到用户给当前 Loader 传入的 options
    const options = this.getOptions(); // webpack5 开始可直接使用 this.getOptions() 代替 loader-utils.getOptions(this)
    // console.log('options: ', options); 
    // 通过 this.callback 告诉 Webpack 返回的结果
    this.callback(null, addSign(source, options.sign)); // this.callback 是 Webpack 给 Loader 注入的 API
    // 当你使用 this.callback 返回内容时，该 Loader 必须返回 undefined，
    // 以让 Webpack 知道该 Loader 返回的结果在 this.callback 中，而不是 return 中 
    return undefined;
    // return source;
}

function addSign(content, sign) {
    return `/** ${sign} */\n${content}`
}
```

#### 一个清除所有 console.log 的 loader
具体代码参考 [custom-loader/console-loader.js](https://github.com/tywd/webpack-learn/tree/master/custom-loader/console-loader.js) 
```js
// 自定义loader 功能是在编译出的代码中简单做一下去除代码中的 console.log 
module.exports = function (source) {
    return handleConsole(source)
}

function handleConsole(content) {
    return content.replace(/console.log\(['|"](.*?)['|"]\)/, '')
}
```
以上loader如何使用请参考下面  # 使用编写好的自定义loader
### 编写 loader 常用 API 参考
`this.callback`： 可以同步或者异步调用的并返回多个结果的函数。预期的参数是：
```js
/* 第一个参数必须是 Error 或者 null
第二个参数是一个 string 或者 Buffer。
可选的：第三个参数必须是一个可以被 this module 解析的 source map。
可选的：第四个参数，会被 webpack 忽略，可以是任何东西（例如一些元数据）。 */
this.callback(
  err: Error | null,
  content: string | Buffer,
  sourceMap?: SourceMap,
  meta?: any
);
```
`this.data`:在 pitch 阶段和 normal 阶段之间共享的 data 对象。

`this.context`：当前处理文件的所在目录，假如当前 Loader 处理的文件是 /src/main.js，则 this.context 就等于 /src。

`this.resource`：当前处理文件的完整请求路径，包括 querystring，例如 /src/main.js?name=1。

`this.resourcePath`：当前处理文件的路径，例如 /src/main.js。

`this.resourceQuery`：当前处理文件的 querystring。

`this.target`：等于 Webpack 配置中的 Target，详情见 2-7其它配置项-Target。

`this.cacheable`：开始缓存，如果为每个构建重新执行重复的转换操作，这样Webpack构建可能会变得非常慢。Webpack 默认会缓存所有loader的处理结果，也就是说，当待处理的文件或者依赖的文件没有变化时，不会再次调用对应的loader进行转换操作，如果不想Webpack这个loader进行缓存，也可以关闭缓存 `this.cacheable(false)`

`this.loadModule`：当 Loader 在处理一个文件时，如果依赖其它文件的处理结果才能得出当前文件的结果时， 就可以通过 this.loadModule(request: string, callback: function(err, source, sourceMap, module)) 去获得 request 对应文件的处理结果。

`this.resolve`：像 require 语句一样获得指定文件的完整路径，使用方法为 resolve(context: string, request: string, callback: function(err, result: string))。

`this.addDependency`：给当前处理文件添加其依赖的文件，以便再其依赖的文件发生变化时，会重新调用 Loader 处理该文件。使用方法为 addDependency(file: string)。

`this.addContextDependency`：和 addDependency 类似，但 addContextDependency 是把整个目录加入到当前正在处理文件的依赖中。使用方法为 addContextDependency(directory: string)。

`this.clearDependencies`：清除当前正在处理文件的所有依赖，使用方法为 clearDependencies()。

`this.emitFile`：输出一个文件，使用方法为 emitFile(name: string, content: Buffer|string, sourceMap: {...})。

其它没有提到的 API 可以去 [Webpack api/loaders](https://webpack.js.org/api/loaders/) 官网 查看。

# 使用编写好的自定义loader
webpack.config.js 里配置\
1.匹配单个自定义loader可以写全路径
```js
module.exports = {
    module: {
        rules:[
            {
                test: /\.js$/
                use: [
                    {
                        loader: path.resolve('./custom-loader/basic-loader.js'),
                        options: {/* ... */}
                    }
                ]
            }
        ]
    }
}
```
2.匹配多个loader 使用数组
```js
module.exports = {
// ...
    resolveLoader: {
        // 这里就是说先去找 node_modules 目录中，如果没有的话再去 loaders 目录查找
        modules: [
            'node_modules',
            path.resolve(__dirname, 'loaders')
        ],
        // 也可使用 直接配置别名
        //     alias: {
        //         "company-loader": path.resolve(__dirname, "./custom-loader/company-loader.js"),
        //         "console-loader": path.resolve(__dirname, "./custom-loader/console-loader.js")
        //     }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['console-loader',
                    {
                        loader: 'company-loader',
                        options: {
                            sign: 'tywd@2022',
                        },
                    },
                ],
            }
        ]
    },
}
```
# 开发中常用的loader
### 1. babel-loader
babel-loader基于babel，用于解析JavaScript文件。babel有丰富的预设和插件，babel的配置可以直接写到options里或者单独写道配置文件里。
Babel是一个Javscript编译器，可以将高级语法(主要是ECMAScript 2015+ )编译成浏览器支持的低版本语法，它可以帮助你用最新版本的Javascript写代码，提高开发效率。
webpack通过babel-loader使用Babel。
```js
// 配置自己使用 babel 相关预设
"@babel/core": "^7.18.2",
"@babel/plugin-transform-runtime": "^7.18.2", // 用法说明参考 https://zhuanlan.zhihu.com/p/147083132
"@babel/preset-env": "^7.18.2", // ES2015+ 语法
"@babel/runtime": "^7.18.3",
"@babel/runtime-corejs3": "^7.18.3",
"babel-loader": "^8.2.5",
```
建立一个Babel配置文件来指定编译的规则。

Babel配置里的两大核心：插件数组(plugins) 和 预设数组(presets)。

Babel 的预设（preset）可以被看作是一组Babel插件的集合，由一系列插件组成。

详细可参考 [# babel中文网 配置文件相关文档](https://www.babeljs.cn/docs/configuration)\
[# 插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)

```js
module.exports = {
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
    //           presets: [
    //             ['@babel/preset-env', { targets: "defaults" }]
    //           ],
              plugins: ['@babel/plugin-proposal-class-properties'],
              // 缓存 loader 的执行结果到指定目录，默认为node_modules/.cache/babel-loader，之后的 webpack 构建，将会尝试读取缓存
              cacheDirectory: true,
            }
          }
        }
      ]
    }
}
```
以上options参数也可单独写到配置文件里，许多其他工具都有类似的配置文件：ESLint (.eslintrc)、Prettier (.prettierrc)。
配置文件我们一般只需要配置 presets(预设数组) 和 plugins(插件数组) ，其他一般也用不到，代码示例如下：
```js
// 该文件可以为 babel.config.js 或者 .babelrc
module.exports = {
    plugins: [
        ['@babel/plugin-transform-runtime',
            {
                regenerator: false
            }
        ],
    ]
}
```
### 2. file-loader
用于打包文件类型的资源，比如对png、jpg、gif等图片资源使用file-loader，然后就可以在JS中加载图片了
```js
const path = require('path');
module.exports = {
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif)$/,
                use: 'file-loader',
            }
        ],
    },
}
```
### 3. url-loader
有 file-loader 一般就有 url-loader，它们很相似，唯一区别是用户可以设置文件大小阈值。 大于阈值时返回与file-loader相同的publicPath，小于阈值时返回文件base64编码。
```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 1024, // 1024B 指定文件的最大大小（以字节为单位）
                        name: '[name].[ext]',
                        fallback: { // 指定当目标文件的大小超过限制时要使用的替代加载程序。
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]'
                            }
                        }
                    },
                },
            }
        ]
    }
}
```
### 4. style-loader与css-loader
这两loader 一般都配套使用
其中module.rules代表模块的处理规则。 每个规则可以包含很多配置项

test 可以接收正则表达式或元素为正则表达式的数组。 只有与正则表达式匹配的模块才会使用此规则。 在此示例中，/\.css$/ 匹配所有以 .css 结尾的文件。

use 可以接收一个包含规则使用的加载器的数组。 如果只配置了一个css-loader，当只有一个loader时也可以为字符串

css-loader 的作用只是处理 CSS 的各种加载语法（@import 和 url() 函数等），如果样式要工作，则需要 style-loader 将样式插入页面

style-loader加到了css-loader前面，因为在Webpack打包时是按照数组从后往前的顺序将资源交给loader处理的，最后生效的放在前面
```js
module.exports = {
    // ...
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
            exclude: /node_modules/,
            include: /src/,
        }],
    },
}
```
>exclude与include\
>include代表该规则只对正则匹配到的模块生效\
>exclude代表所有被正则匹配到的模块都排除在该规则之外
### 5. sass-loader
处理css 预处理器 sass，sass与scss 是同样的，一般安装sass-loader 还要配合安装 node-sass
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
};
```
sass-loader 加载器使用 node-sass 实现的示例:\
配置 browserslist，让 css 样式自动添加兼容浏览器前缀\
```js
// package.json
{
  "devDependencies": {
    "sass-loader": "^7.2.0",
    "node-sass": "^5.0.0"
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "Android >= 4.0",
    "iOS >= 8"
  ]
}
```
### 6. raw-loader
可将文件作为字符串导入，比如想直接导入 .txt 或者 .svg
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(txt|svg)$/,
        use: 'raw-loader'
      }
    ]
  }
}
// 使用 比如在 app.js 中
import txt from './file.txt';
import txt from './file.svg';

```
### 7. vue-loader
用来处理 vue 文件,还需安装 `vue-template-compiler` 来编译Vue模板，\
Vue3.x 使用 `@vue/compiler-sfc"` 估计现在大部分都用脚手架了
```js
module.exports = {
  module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader',
            }
        ]
    }
}
```
### 8. ts-loader
`TypeScript` 使用得越来越多，对于平时写代码有了更好的规范，项目更加利于维护，我们也在Webpack中来配置loader,本质上类似于 babel-loader，是一个连接 Webpack 和 Typescript 的模块
为webpack提供的 TypeScript loader，打包编译Typescript\
需要安装 `typescript` 与 `ts-loader`\
安装后初始化 tsconfig.json ，执行 `tsc --init `，生成一个 tsconfig.json 进行配置，更多配置参考 [Typescript 官网](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
```js
{
  "compilerOptions": {
    // 目标语言的版本
    "target": "esnext",
    // 生成代码的模板标准
    "module": "esnext",
    "moduleResolution": "node",
    // 允许编译器编译JS，JSX文件
    "allowJS": true,
    // 允许在JS文件中报错，通常与allowJS一起使用
    "checkJs": true,
    "noEmit": true,
    // 是否生成source map文件
    "sourceMap": true,
    // 指定jsx模式
    "jsx": "react"
  },
  // 编译需要编译的文件或目录
  "include": [
    "src",
    "test"
  ],
  // 编译器需要排除的文件或文件夹
  "exclude": [
    "node_modules",
    "**/*.spec.ts"
  ]
}
```
配置 ts-loader
```js
module.exports = {
  module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            }
        ]
    }
}
```
### 9. thread-loader
安装 `npm i -D thread-loader`

放置在其他 loader 之前，在这个 loader 之后的 loader 就会在单独的 worker 池(worker pool)中运行

在 worker 池(worker pool)中运行的 loader 是受到限制的。例如：

- 这些 loader 不能产生新的文件。
- 这些 loader 不能使用定制的 loader API（也就是说，通过插件）。
- 这些 loader 无法获取 webpack 的选项设置。
- 每个 worker 都是一个单独的有 600ms 限制的 node.js 进程。同时跨进程的数据交换也会被限制。

所以一般仅在耗时的 loader 上使用
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve("src"),
        use: [
          "thread-loader",
          "babel-loader"
          // your expensive loader - expensive(昂贵的)，一般是指 babel-loader 这种性能开销较大的loader
        ]
      }
    ]
  }
}
```
> ps: 预热：可以通过预热 worker 池(worker pool)来防止启动 worker 时的高延时。
>
> 这会启动池(pool)内最大数量的 worker 并把指定的模块载入 node.js 的模块缓存中。
```js
const threadLoader = require('thread-loader');
threadLoader.warmup({
  // pool options, like passed to loader options
  // must match loader options to boot the correct pool
}, [
  // modules to load
  // can be any module, i. e.
  'babel-loader',
  'babel-preset-es2015',
  'sass-loader',
]);
```

更多配置请参考 npm [thread-loader](https://www.npmjs.com/package/thread-loader)
### 10. cache-loader
安装 `npm i -D thread-loader`

通常在一些性能开销较大的 loader 之前添加此 loader，以将结果缓存到磁盘里。

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.ext$/,
        use: ["cache-loader", "babel-loader"],
        include: path.resolve('src'),
      },
    ],
  },
};
```
>PS: 请注意，保存和读取这些缓存文件会有一些时间开销，所以请只对性能开销较大的 loader 使用此 loader。如babel-loader

更多配置请参考 npm [cache-loader](https://www.npmjs.com/package/cache-loader)
# 写在最后
## 参考文章
[# 深入浅出的webpack](https://webpack.wuhaolin.cn/5%E5%8E%9F%E7%90%86/5-4%E7%BC%96%E5%86%99Plugin.html)

[# 吐血整理的webpack入门知识及常用loader和plugin](https://juejin.cn/post/7067051380803895310)

[# webpack中文](https://webpack.html.cn/)

## 代码地址
https://github.com/tywd/webpack-learn

以上的方式总结只是自己学习总结，有其他方式欢迎各位大佬评论\
**渣渣一个，欢迎各路大神多多指正，不求赞，只求监督指正(￣.￣)**\
**有关文章经常被面试问到可以帮忙留下言，小弟也能补充完善完善一起交流学习，感谢各位大佬(～￣▽￣)～**