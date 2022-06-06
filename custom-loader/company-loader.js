/*
 * @Author: tywd
 * @Date: 2022-06-03 20:48:56
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-03 22:44:06
 * @FilePath: /webpack-learn/custom-loader/company-loader.js
 * @Description: 实现一个简易自定义loader
 */
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