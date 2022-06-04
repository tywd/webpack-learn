/*
 * @Author: tywd
 * @Date: 2022-06-04 13:12:32
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-04 18:27:52
 * @FilePath: /webpack-learn/custom-plugins/basic-plugin.js
 * @Description: 自定义plugin，罗列一些常用 api
 */
const {
    validate
} = require('schema-utils'); // 校验传入参数
// 选项对象的 schema
const schema = {
    type: 'object',
    properties: {
        name: { // 描述了配置项的结构：一个对象，只能有 name 属性，且该属性的值为字符串类型。
            type: 'string',
            description: "BasicPlugin - name",
        },
    },
    additionalProperties: false // 不允许再附加属性，如上说明options 只能传入 name 且 只能为 string 类型

};
// 以下测试会报错，因为name 需要 string， 并且不可再附加属性
// validate(schema, {name: true, type: 'tywd'});
// 具体可参照 https://www.npmjs.com/package/schema-utils

const HtmlWebpackPlugin = require('html-webpack-plugin');
class BasicPlugin {
    // 在构造函数中获取用户给该插件传入的配置
    constructor(options) {
        // !校验插件传参
        validate(schema, options, {
            name: 'Hello World Plugin',
            baseDataPath: 'options',
            postFormatter: (formattedError, error) => { // 该附加方法为可选属性，可自定义报错信息
                console.log('formattedError: ', formattedError);
                console.log('error: ', error);
                if (error.keyword === "type") {
                    return `${formattedError}\nBut I got a ${typeof error.data}.`;
                }
                return formattedError;
            },
        });
        console.log('BasicPlugin-options: ', options);
    }
    // Webpack 会调用 BasicPlugin 实例的 apply 方法给插件实例传入 compiler 对象
    apply(compiler) {
        // console.log('hasHtmlWebpackPlugin(compiler): ', hasHtmlWebpackPlugin(compiler));
        // !同步编译插件
        // 指定一个挂载到 compilation 的钩子，回调函数的参数为 compilation 。
        /* compiler.hooks.compilation.tap('BasicPlugin', (compilation) => {
            // 现在可以通过 compilation 对象绑定各种钩子
            compilation.hooks.optimize.tap('BasicPlugin', () => {
                console.log('BasicPlugin-资源已经优化完毕。');
            });
        }); */
        
        // !异步编译插件
        // 指定一个挂载到 webpack 自身的事件钩子。 除了 tapSync 还可 使用 tapPromise 返回一个promise
        compiler.hooks.emit.tapAsync('BasicPlugin', (compilation, callback) => {
            console.log('这是一个示例插件！');
            // console.log('这里表示了资源的单次构建的 `compilation` 对象：', compilation);
            // 用 webpack 提供的插件 API 处理构建过程
            // compilation.addModule( /* ... */ );

            callback();
        });

        // tapPromise
        /* compiler.hooks.emit.tapPromise('HelloAsyncPlugin', (compilation) => {
            // 返回一个 pormise ，异步任务完成后 resolve
            return new Promise((resolve, reject) => {
                setTimeout(function () {
                    console.log('异步任务完成...');
                    resolve();
                }, 1000);
            });
        }); */
    }
}

/**
 * @Descripttion: 判断当前配置使用使用了 HtmlWebpackPlugin，
 * @param {*} compiler Webpack 在 apply(compiler) 中传入的参数
 * @return {boolean} 
 */
function hasHtmlWebpackPlugin(compiler) {
    // 当前配置所有使用的插件列表
    const plugins = compiler.options.plugins;
    // 去 plugins 中寻找有没有 HtmlWebpackPlugin 的实例
    // return plugins.find(plugin => plugin.__proto__.constructor === HtmlWebpackPlugin) != null;
    return plugins.find(plugin => Object.getPrototypeOf(plugin).constructor === HtmlWebpackPlugin) != null;
}

// 导出 Plugin
module.exports = BasicPlugin;