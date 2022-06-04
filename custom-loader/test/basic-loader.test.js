/*
 * @Author: tywd
 * @Date: 2022-06-04 20:53:41
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-04 21:05:12
 * @FilePath: /webpack-learn/custom-loader/test/basic-loader.test.js
 * @Description:  测试 basic-loader 
 */
/**
 * @jest-environment node
 */
 import compiler from './compiler.js';

 test('Inserts name and outputs JavaScript', async () => {
   const stats = await compiler('example.txt', { name: 'Alice' });
   const output = stats.toJson({ source: true }).modules[0].source;
 
   expect(output).toBe('export default "Hey Alice!"');
 });