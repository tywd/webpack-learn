# loader
## 什么是Loader
一个loader可以看做是一个node模块，也可以看做一个loader就是一个函数 (loader会导出一个函数)，众所周知webpack只能识别js文件，loader在webpack中担任的角色就是翻译工作，它可以让其它非js的资源（source）可以在webpack中通过loader顺利加载。
Loader的方式

- 单一职责，一个loader只做一件事
- 调用方式，loader是从右向左执行，链式调用
- 统一原则，loader输入和输出都字符串

## 编写自定义loader
[webpack 官方编写介绍](https://webpack.docschina.org/contribute/writing-a-loader/)
### 编写准则
编写自定义的 loader 时，官方提供了一套用法准则（Guidelines），在编写的时候应该按照这套准则来使 loader 标准化：
- 简单易用。
- 使用链式传递。（由于 loader 是可以被链式调用的，所以请保证每一个 loader 的单一职责）
- 模块化的输出。
- 确保无状态。（不要让 loader 的转化中保留之前的状态，每次运行都应该独立于其他编译模块以及相同模块之前的编译结果）
- 充分使用官方提供的 loader utilities。
- 记录 loader 的依赖。
- 解析模块依赖关系。

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
### 2. ts-loader
### 3. markdown-loader
### 4. vue-loader
### 5. file-loader
### 6. url-loader
### 7. svg-sprite-loader
### 8. style-loader
### 9. css-loader
### 10. postcss-loader
### 11. sass-loader
### 12. thread-loader
### 13. cache-loader
### 14. raw-loader