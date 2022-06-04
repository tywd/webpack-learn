# loader
## 什么是Loader
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

## 编写自定义loader
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
- 同步 loader
- 异步 loader
- "Raw" Loader
- Pitching loader

[webpack loader 4种类型](https://webpack.docschina.org/api/loaders/#examples)

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

`this.context`：当前处理文件的所在目录，假如当前 Loader 处理的文件是 /src/main.js，则 this.context 就等于 /src。

`this.resource`：当前处理文件的完整请求路径，包括 querystring，例如 /src/main.js?name=1。

`this.resourcePath`：当前处理文件的路径，例如 /src/main.js。

`this.resourceQuery`：当前处理文件的 querystring。

`this.target`：等于 Webpack 配置中的 Target，详情见 2-7其它配置项-Target。

`this.loadModule`：当 Loader 在处理一个文件时，如果依赖其它文件的处理结果才能得出当前文件的结果时， 就可以通过 this.loadModule(request: string, callback: function(err, source, sourceMap, module)) 去获得 request 对应文件的处理结果。

`this.resolve`：像 require 语句一样获得指定文件的完整路径，使用方法为 resolve(context: string, request: string, callback: function(err, result: string))。

`this.addDependency`：给当前处理文件添加其依赖的文件，以便再其依赖的文件发生变化时，会重新调用 Loader 处理该文件。使用方法为 addDependency(file: string)。

`this.addContextDependency`：和 addDependency 类似，但 addContextDependency 是把整个目录加入到当前正在处理文件的依赖中。使用方法为 addContextDependency(directory: string)。

`this.clearDependencies`：清除当前正在处理文件的所有依赖，使用方法为 clearDependencies()。

`this.emitFile`：输出一个文件，使用方法为 emitFile(name: string, content: Buffer|string, sourceMap: {...})。

其它没有提到的 API 可以去 [Webpack api/loaders](https://webpack.js.org/api/loaders/) 官网 查看。

## 使用编写好的自定义loader
webpack.config.js 里配置\
1.匹配单个自定义loader可以写全路径
```js
module: {
    rules:[
        {
            test: /\.js$/
            use: [
                {
                    loader: path.resolve('path/to/loader.js'),
                    options: {/* ... */}
                }
            ]
        }
    ]
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
## 开发中常用的loader
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
### 3. url-loader
### 4. svg-sprite-loader
### 5. style-loader
### 6. css-loader
### 7. postcss-loader
### 8. sass-loader
### 9. thread-loader
### 10. cache-loader
### 11. vue-loader
### 12. raw-loader
### 13. ts-loader
### 14. markdown-loader

## 参考文章
[# 深入浅出的webpack](https://webpack.wuhaolin.cn/5%E5%8E%9F%E7%90%86/5-4%E7%BC%96%E5%86%99Plugin.html)

[# 吐血整理的webpack入门知识及常用loader和plugin](https://juejin.cn/post/7067051380803895310)