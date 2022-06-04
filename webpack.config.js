//webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';
const config = require('./public/config')[isDev ? 'dev' : 'build'];
const path = require('path')
const BasicPlugin = require('./custom-plugins/basic-plugin.js'); // 自定义basicPlugin
const FileListPlugin = require('./custom-plugins/filelist-plugin.js'); // 自定义basicPlugin
const EndWebpackPlugin = require('./custom-plugins/end-webpack-plugin.js'); // 自定义basicPlugin

module.exports = {
    mode: "development",
    devtool: 'eval-cheap-module-source-map',
    resolveLoader: {
        alias: {
            "console-loader": path.resolve(__dirname, "./custom-loader/console-loader.js"),
            "company-loader": path.resolve(__dirname, "./custom-loader/company-loader.js")
        }
        // 这里就是说先去找 node_modules 目录中，如果没有的话再去 loaders 目录查找
        // modules: [
        //     'node_modules',
        //     path.resolve(__dirname, 'custom-loader')
        // ]
    },
    module: {
        rules: [{
                test: /\.js?$/,
                use: {
                    loader: 'babel-loader',
                    //   一下options 也可卸载 .babelrc 文件里
                    //   options: {
                    //       presets: ["@babel/preset-env"],
                    //       plugins: [
                    //           [
                    //               "@babel/plugin-transform-runtime",
                    //               {
                    //                   "corejs": 3
                    //               }
                    //           ]
                    //       ]
                    //   }
                },
                exclude: /node_modules/ // 排除 node_modules 目录，node_modules 依赖一般没必要编译
            },
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
    plugins: [
        // plugins是存放所有的webpack插件的数组
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html', // 打包后的文件名
            minify: {
                removeAttributeQuotes: false, // 是否删除属性的双引号
                collapseWhitespace: false, // 是否折叠空白
            },
            hash: true, // 是否加上hash，默认是 false
            config: config.template
        }),
        new BasicPlugin({
            name: '123'
        }),
        new FileListPlugin({
            outputFile: 'my-assets.md',
        }),
        // 在初始化 EndWebpackPlugin 时传入了两个参数，分别是在成功时的回调函数和失败时的回调函数；
        new EndWebpackPlugin(
            () => {
                // Webpack 构建成功，并且文件输出了后会执行到这里，在这里可以做发布文件操作
                console.log('EndWebpackPlugin - webpack 最后构建成功的回调　ｓｕｃｃｅｓｓ')
            },
            (err) => {
                // Webpack 构建失败，err 是导致错误的原因
                console.error('EndWebpackPlugin - webpack 最后构建成功的回调　ｅｒｒｏｒ', err);
            }
        )
    ],
    devServer: {
        // hot: true, // 启用热替换，默认为true
        // liveReload: true, // 默认情况下，当检测到文件更改时，开发服务器将重新加载/刷新页面。
        // host: '0.0.0.0', // 域名
        open: true, // 启动后自动打开默认浏览器运行
        port: '8090', // 默认是8080
        compress: true, // 是否启用 gzip 压缩
        client: {
            logging: 'error', // 允许在浏览器中设置日志级别，若不想看见一开始的一些打印启用热更新的提示将不会显示，而是有 error 才显示，还有其他属性 warn | info
            overlay: {
                errors: true, // 默认为true，启用 overlay 后，当编译出错时，会在浏览器窗口全屏输出错误
                warnings: false, // 默认为true，警告 不输出全屏提示
            },
        },
    }
}