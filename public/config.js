/*
 * @Author: tywd
 * @Date: 2022-06-03 15:50:55
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-03 16:11:14
 * @FilePath: /webpack-learn/public/config.js
 * @Description: Do not edit
 */
//public/config.js 除了以下的配置之外，这里面还可以有许多其他配置，例如,pulicPath 的路径等等
module.exports = {
    dev: {
        template: {
            title: '哈哈哈哈哈哈',
            header: false,
            footer: false
        }
    },
    build: {
        template: {
            title: '呵呵呵呵呵呵',
            header: true,
            footer: true
        }
    }
}
