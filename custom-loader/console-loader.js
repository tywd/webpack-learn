/*
 * @Author: tywd
 * @Date: 2022-06-03 21:55:30
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-06 16:36:32
 * @FilePath: /webpack-learn/custom-loader/console-loader.js
 * @Description: 自定义loader 功能是在编译出的代码中简单做一下去除代码中的 console.log 
 */
module.exports = function (source) {
    return handleConsole(source)
}

function handleConsole(content) {
    return content.replace(/console.log\(['|"](.*?)['|"]\)/, '')
}