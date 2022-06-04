/*
 * @Author: tywd
 * @Date: 2022-06-04 13:17:19
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-04 13:23:45
 * @FilePath: /webpack-learn/custom-plugin/end-webpack-plugin.js
 * @Description: 自定义插件
 * 在 Webpack 即将退出时再附加一些额外的操作，如在 Webpack 成功编译和输出了文件后执行发布操作把输出的文件上传到服务器。 
 * 同时该插件还能区分 Webpack 构建是否执行成功
 * 传入两个回调函数，一个成功时执行，一个失败时执行
 * done：在成功构建并且输出了文件后，Webpack 即将退出时发生；
 * failed：在构建出现异常导致构建失败，Webpack 即将退出时发生；
 */
class EndWebpackPlugin {
    // 在构造函数中获取用户给该插件传入的配置
    constructor(doneCallback, failCallback) {
        // 存下在构造函数中传入的回调函数
        this.doneCallback = doneCallback;
        this.failCallback = failCallback;
    }

    apply(compiler) {
        compiler.hooks.done.tap('EndWebpackPlugin', (stats) => {
            this.doneCallback(stats); // 在 done 事件中回调 doneCallback
        })
        compiler.hooks.failed.tap('EndWebpackPlugin', (err) => {
            this.failCallback(err); // 在 failed 事件中回调 failCallback
        })
    }
}

// 导出 Plugin
module.exports = EndWebpackPlugin;