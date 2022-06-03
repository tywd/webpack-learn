/*
 * @Author: tywd
 * @Date: 2022-06-03 21:55:30
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-03 21:55:30
 * @FilePath: /webpack-learn/custom-loader/console-loader.js
 * @Description: 自定义loader 功能是在编译出的代码中简单做一下去除代码中的 console.log 
 */
module.exports = function (content) {
    return handleConsole(content)
}

function handleConsole(content) {
    return content.replace(/console.log\(['|"](.*?)['|"]\)/, '')
}