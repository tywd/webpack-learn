# plugin
## 什么是Plugin
Webpack 通过 Plugin 机制让其更加灵活，以适应各种应用场景。 在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果，Plugin 的出现就是为了丰富 Webpack 的 API。

一个最基础的 Plugin 的代码是这样的：
```js
class BasicPlugin{
  // 在构造函数中获取用户给该插件传入的配置
  constructor(options){}

  // Webpack 会调用 BasicPlugin 实例的 apply 方法给插件实例传入 compiler 对象
  apply(compiler){
    // 指定一个挂载到 compilation 的钩子，回调函数的参数为 compilation 。
    compiler.hooks.compilation.tap('BasicPlugin', (compilation) => {
      // 现在可以通过 compilation 对象绑定各种钩子
      compilation.hooks.optimize.tap('BasicPlugin', () => {
        console.log('资源已经优化完毕。');
      });
    });
  }
}

// 导出 Plugin
module.exports = BasicPlugin;
```
使用这个 Plugin 时，配置如下：
```js
const BasicPlugin = require('./BasicPlugin.js');
module.export = {
  plugins:[
    new BasicPlugin({name:'tywd'}),
  ]
}
```
Webpack 启动后，在读取配置的过程中会先执行 new BasicPlugin(options) 初始化一个 BasicPlugin 获得其实例。 在初始化 compiler 对象后，再调用 basicPlugin.apply(compiler) 给插件实例传入 compiler 对象。 插件实例在获取到 compiler 对象后，就可以通过 compiler.plugin(事件名称, 回调函数) 监听到 Webpack 广播出来的事件。 并且可以通过 compiler 对象去操作 Webpack。

这就是 Plugin 的工作原理，实际开发中还有很多细节，继续往下看。

## 编写自定义plugin
[webpack 官方编写介绍](https://webpack.docschina.org/contribute/writing-a-plugin/)
### plugin基本结构
一个最基本的 plugin 需要包含这些部分，在开发插件时需要注意：

- 一个 JavaScript 类
- 一个 apply 方法，apply 方法在 webpack 装载这个插件的时候被调用，并且会传入 compiler 对象。只要能拿到 Compiler 或 Compilation 对象，就能广播出新的事件，所以在新开发的插件中也能广播出事件，给其它插件监听使用。
- 使用不同的 webpack 提供的 hooks 来指定自己需要发生的处理行为
- 在异步调用时，异步的事件会附带两个参数，第二个参数为回调函数 callback，在插件处理完任务时需要调用回调函数通知 Webpack，才会进入下一处理流程。或者需要通过 return Promise 的方式。在下面会介绍 tapAsync 和 tapPromise

传给每个插件的 Compiler 和 Compilation 对象都是同一个引用。也就是说在一个插件中修改了 Compiler 或 Compilation 对象上的属性，会影响到后面的插件。

### Compiler 和 Compilation
在开发 Plugin 时最常用的也是最重要的两个对象就是 Compiler 和 Compilation，它们是 Plugin 和 Webpack 之间的桥梁。 
- Compiler 对象包含了 Webpack 环境所有的的配置信息，包含 options，loaders，plugins 这些信息，这个对象在 Webpack 启动时候被实例化，它是全局唯一的，可以简单地把它理解为 Webpack 实例；上面提到的 apply 方法传入的参数就是它。 在为 webpack 开发插件时，你可能需要知道每个钩子函数是在哪里调用的。想要了解这些内容，请在 webpack 源码中搜索 `hooks.<hook name>.call`

- Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。当 Webpack 以开发模式运行时，每当检测到一个文件变化，一次新的 Compilation 将被创建。Compilation 对象也提供了很多事件回调供插件做扩展。通过 Compilation 也能读取到 Compiler 对象。

Compiler 和 Compilation 的区别在于：Compiler 代表了整个 Webpack 从启动到关闭的生命周期，而 Compilation 只是代表了一次新的编译。

Compiler 和 Compilation 提供了非常多的钩子供我们使用，这些方法的组合可以让我们在构建过程的不同时间获取不同的内容，具体可查看官方中文文档

[webpack/api/compiler-hooks](https://webpack.docschina.org/api/compiler-hooks/)

[webpack/api/compilation-hooks](https://webpack.docschina.org/api/compilation-hooks/)

### 事件流机制
Webpack 就像一条生产线，要经过一系列处理流程后才能将源文件转换成输出结果。 这条生产线上的每个处理流程的职责都是单一的，多个流程之间有存在依赖关系，只有完成当前处理后才能交给下一个流程去处理。 插件就像是一个插入到生产线中的一个功能，在特定的时机对生产线上的资源做处理。

webpack 本质上是一种事件流的机制，它的工作流程就是将各个插件串联起来，而实现这一切的核心就是 Tapable。

Webpack 的 Tapable 事件流机制保证了插件的有序性，将各个插件串联起来， Webpack 在运行过程中会广播事件，插件只需要监听它所关心的事件，就能加入到这条 webapck 机制中，去改变 webapck 的运作，使得整个系统扩展性良好。

Tapable 也是一个小型的 library，是 Webpack 的一个核心工具。类似于 node 中的 events 库，核心原理就是一个订阅发布模式。作用是提供类似的插件接口。
Compiler 和 Compilation 都继承自 Tapable，可以直接在 Compiler 和 Compilation 对象上广播和监听事件
```js
//  广播事件
compiler.apply('event-name', params)
compilation.apply('event-name', params)

// 监听事件
compiler.plugin('event-name', function (params) {})
compilation.plugin('event-name', function (params) {})
```
### 同步与异步
plugin 的 hooks 是有同步和异步区分的\
在同步的情况下，上面笔者使用 `<hookName>.tap` 的方式进行调用\
而在异步 hook 内我们可以进行一些异步操作，并且有异步操作的情况下，请使用 tapAsync 或者 tapPromise 方法来告知 webpack 这里的内容是异步的

#### tapAsync
需要多传一个回调
```js
class HelloPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('HelloPlugin', (compilation, callback) => {
      setTimeout(() => {
        console.log('async')
        callback()
      }, 1000)
    })
  }
}
module.exports = HelloPlugin
```
#### tapPromise
需要返回一个 Promise 对象并且让它在结束的时候 resolve
```js
class HelloPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapPromise('HelloPlugin', (compilation) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('async')
          resolve()
        }, 1000)
      })
    })
  }
}
module.exports = HelloPlugin
```

### 编写 plugin 常用 API 参考
参考 basic-plugin.js 的构建
#### 判断 Webpack 使用了哪些插件
参考 basic-plugin.js hasHtmlWebpackPlugin 方法


## 使用编写好的自定义plugin
参考上面 [什么是Plugin](#什么是Plugin)

## 开发中常用的plugin
### 1. html-webpack-plugin
将一个页面模板打包到dist目录下，默认都是自动引入js or css
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>首页</title>
</head>
<body>
    <div id="app"></div>
</body>
</html>
```
```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',  // 以本地的index.html文件为基础模板
            filename: "index.html",  // 输出到dist目录下的文件名称
        }),
    ]
}

```
### 2. clean-webpack-plugin
用于每次打包dist目录删除
```js
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
    plugins: [
        new CleanWebpackPlugin()
    ]
}
```
### 3. copy-webpack-plugin
用于将文件拷贝到某个目录下
```js
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "./main.js",
                    to: __dirname + "/dist/js",
                    toType: "dir"
                }
            ]
        })
    ]
}
```
上面配置中，将main.js拷贝到dist目录下的js里，toType默认是file，也可以设置为dir，因为我这dist目录下没有js目录。
### 4. mini-css-extract-plugin
都是将css样式提取出来，需要配合 css-loader
```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                   MiniCssExtractPlugin.loader,
                   "css-loader"
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/[name].css",
            chunkFilename: "css/[name].css"
        })
    ]
}
```
### 5. optimize-css-assets-webpack-plugin
用于压缩css样式
```js
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin")
module.exports = {
    plugins: [
        new OptimizeCssAssetsWebpackPlugin(),
    ]
}
```
### 6. webpack.HotModuleReplacementPlugin
开启热模块更新，无需安装，webpack内置
```js
const Webpack = require("webpack")
module.exports = {
    plugins: [
        new Webpack.HotModuleReplacementPlugin()
    ]
}
```
### 8. webpack.DefinePlugin
用于注入全局变量，一般用在环境变量上。无需安装，webpack内置
```js
const Webpack = require("webpack")
module.exports = {
    plugins: [
        new Webpack.DefinePlugin({
          STR: JSON.stringify("蛙人"),
          "process.env": JSON.stringify("dev"),
          name: "蛙人"
        })
    ]
}
```
上面配置中，DefinePlugin接收一个对象，里面的key值对应一个value值，这个value值是一个代码片段，可以看上面name那个，会报错 蛙人 is not defined，这里需要注意，value值必须是一个变量或代码片段。
### 9. webpack.ProvidePlugin
用于定义全局变量，如100个页面都引入vue，每个页面都引入只会增加工作量，直接在webpackProvide挂载一个变量就行，不用再去一一引入。无需安装，webpack内置
```js
const Webpack = require("webpack")
module.exports = {
    plugins: [
        new Webpack.ProvidePlugin({
            "Vue": ["vue", "default"] 
        })
    ]
}
```
上面配置中，ProvidePlugin接收一个对象，key值是使用的变量，value值第一个参数是Vue模块，第二个参数默认取Es Module.default的属性。import默认引入进来是一个 Es Module的对象，里面有default这个属性就是实体对象
### 10. webpack.SplitChunksPlugin
以下两插件均为 Webpack 内置，无需安装。
- webpack4.0之前使用 `webpack.optimize.CommonsChunkPlugin`
- webpack4.0之后使用 `optimization.SplitChunks`

`optimization.SplitChunks` 配置
```js
// main.js
import Vue from "vue"
console.log(Vue)
import("./news")
```
```js
// news.js
import Vue from "vue"
console.log(Vue)
```
```js
// webpack.config.js
module.exports = {
    mode: "development",
    entry: {
        main: "./main.js"
    },
    output: {
        filename: "[name].js",
        path: __dirname + "/dist"
    },
    optimization: {
        splitChunks: {
            chunks: "all" // all是对所有的chunk都生效，默认只对async异步有效。
        }
    },
}
```
splitChunks默认情况下也有自动提取，默认要求如下：
- 被提取的模块来自node_module目录
- 模块大于30kb
- 按需加载时请求资源最大值小于等于5
- 首次加载时并行请求最大值小于等于3
### 11. webpack.IgnorePlugin
用于过滤打包文件，减少打包体积大小。无需安装，webpack内置
```js
const Webpack = require("webpack")
module.exports = {
    plugins: [
        new Webpack.IgnorePlugin(/.\/lib/, /element-ui/)
    ]
}
```
### 12. uglifyjs-webpack-plugin
用于压缩js文件，针对webpack4版本以上。
```js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
	optimization: {
        minimizer: [
            new UglifyJsPlugin({
                test: /\.js(\?.*)?$/i,
                exclude: /node_modules/
            })
        ]
    }
}
```
### 13. imagemin-webpack-plugin
图片压缩
```js
const ImageminPlugin =  require('imagemin-webpack-plugin').default
module.exports = {
    plugins: [
        new ImageminPlugin({
             test: /\.(jpe?g|png|gif|svg)$/i 
        })
    ]
}
```
### 14. VueLoaderPlugin
Vue文件转换
```js
const { VueLoaderPlugin} = require('vue-loader'); // 来自于vue-loader
module.exports = {
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
    ]
}
```
### 15. webpack-bundle-analyzer
打包分析
```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
module.exports = {
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerPort: 9091,
        generateStatsFile: false
      })
    ]
}
```
### 15. friendly-errors-webpack-plugin
美化控制台，良好的提示错误。终端打印较美观
```js
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
module.exports = {
	plugins: [
		new FriendlyErrorsWebpackPlugin({
			compilationSuccessInfo: {
          notes: ['蛙人你好，系统正运行在http://localhost:' + devServer.port]
      },
      clearConsole: true,
		})
	],
}
```

## 参考文章
[# 深入浅出的webpack](https://webpack.wuhaolin.cn/5%E5%8E%9F%E7%90%86/5-4%E7%BC%96%E5%86%99Plugin.html)

[# 吐血整理的webpack入门知识及常用loader和plugin](https://juejin.cn/post/7067051380803895310)

[# 分享15个Webpack实用的插件！！！](https://juejin.cn/post/6944940506862485511)

[# 手把手教你写一个Vue组件发布到npm且可外链引入使用](https://juejin.cn/post/6943793273395740680)