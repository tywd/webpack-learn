/*
 * @Author: tywd
 * @Date: 2022-06-04 20:40:43
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-04 20:52:36
 * @FilePath: /webpack-learn/custom-loader/basic-loader.js
 * @Description: 自定义loader
 * 1、该 loader 将会处理 .txt 文件，并且将任何实例中的 [name] 直接替换为 loader 选项中设置的 name。
 * 然后返回包含默认导出文本的 JavaScript 模块
 * 2、使用 jest 进行该loader的单元测试 
 */
export default function basicLoader(source) {
    const options = this.getOptions(); // 获取传进来的options选项

    source = source.replace(/\[name\]/g, options.name); // 替换 .txt 里的 [name] 为传进来的 options.name

    return `export default ${JSON.stringify(source)}`; // 以字符串的形式输出
}