/*
 * @Author: tywd
 * @Date: 2022-06-04 20:51:13
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-04 21:08:26
 * @FilePath: /webpack-learn/custom-loader/test/compiler.js
 * @Description:
 * Tip
 * 这种情况下，我们可以使用 webpack 内联 webpack 配置，也可以把配置作为参数传给导出的函数。这允许我们使用相同的编译模块测试多个设置。
 */
import path from 'path';
import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs'; // 使用 memfs 去执行 webpack。这让我们避免向磁盘产生 输出文件，并允许我们访问获取转换模块的统计数据 stats

export default (fixture, options = {}) => {
    const compiler = webpack({
      context: __dirname,
      entry: `./${fixture}`,
      output: {
        path: path.resolve(__dirname),
        filename: 'bundle.js',
      },
      module: {
        rules: [
          {
            test: /\.txt$/,
            use: {
              loader: path.resolve(__dirname, '../basic-loader.js'),
              options,
            },
          },
        ],
      },
    });
  
    compiler.outputFileSystem = createFsFromVolume(new Volume());
    compiler.outputFileSystem.join = path.join.bind(path);
  
    return new Promise((resolve, reject) => {
      // 执行webpack 的 compiler 类的 run 方法进行编译
      compiler.run((err, stats) => {
        if (err) reject(err);
        if (stats.hasErrors()) reject(stats.toJson().errors);
  
        resolve(stats);
      });
    });
  };