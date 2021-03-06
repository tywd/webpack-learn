## webpack 配置学习记录
- 20220603

    babel-loader 配置 转译ES6+ 为 ES5\
    html-webpack-plugin  html模板配置与打包输出\
    cross-env 运行环境\
    webpack-dev-server 启用 devServer 服务，运行在浏览器

## package.json 部分说明
```js
"devDependencies": {
    // start  babel-loader 相关
    "@babel/core": "^7.18.2",
    "@babel/plugin-transform-runtime": "^7.18.2",
    "@babel/preset-env": "^7.18.2",
    "@babel/runtime": "^7.18.3",
    "@babel/runtime-corejs3": "^7.18.3",
    "babel-loader": "^8.2.5",

    // start  运行环境
    "cross-env": "^7.0.3",

    // start html 模板配置与打包输出
    "html-webpack-plugin": "^5.5.0",

    // start webpack
    "webpack": "^5.73.0",
    "webpack-cli": "^4.9.2",

    // start 启用 devServer 服务，运行在浏览器
    "webpack-dev-server": "^4.9.1"

    // start webpack 提供 用于校验传入参数 是否符合 plugin 或者 loader 设定的格式
    "schema-utils": "^4.0.0",

    // start 单元测试 jest
    "babel-jest": "^28.1.0",
    "jest": "^28.1.0",

    // start 使用 memfs 去执行 webpack。这让我们避免向磁盘产生 输出文件，并允许我们访问获取转换模块的统计数据 stats
    "memfs": "^3.4.4",
  }
```
