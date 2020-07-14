---
title: Algorithm on leetcode easy level
slug: algo-leetcode
date: 2020-06-16
cover: ./cover.jpg
generate-card: false
description: leetcode practices logs. 
language: en
tags:
    - programming
    - javascript
    - algorithm
---

> 基于leetcode的算法学习记录文章，使用语言主要是 JavaScript，可能会有少于C/Python实现。

# 数组分类

## [01. 数组中重复的数字](https://leetcode-cn.com/problems/shu-zu-zhong-zhong-fu-de-shu-zi-lcof/)

### 方案一[JavaScript]： reduce + Object.keys + map + filter

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var findRepeatNumber = function (nums) {
  if (!Array.isArray(nums)) return []

  let res = nums.reduce((acc, num) => {
    const k = num + ""
    let v = acc[num + ""] || 0
    if (acc.hasOwnProperty(k)) {
      acc[k] = ++v
    } else {
      acc[k] = 0
    }
    return acc
  }, {})

  const found = +Object.keys(res)
    .map(k => (res[k] ? k : 0))
    .filter(Boolean)[0]

  return found !== found ? -1 : found
}

//console.log(findRepeatNumber([2, 3, 1, 0, 2, 5, 3]))

```

**执行结果：**

<font color="red">执行用时：152 ms, 在所有 JavaScript 提交中击败了24.41%的用户</font>

内存消耗：51.9 MB, 在所有 JavaScript 提交中击败了100.00%的用户

| 提交时间 | 提交结果 | 运行时间 | 内存消耗 | 语言       |
| :------- | :------- | :------- | :------- | :--------- |
| 几秒前   | 通过     | 152 ms   | 51.9 MB  | Javascript |

# 字符串分类

## 删除字符串中重复的字符

https://leetcode.com/articles/remove-all-adjacent-duplicates-in-string/

题解：删除靠着的重复字符，然后对删除后的字符执行同样的操作，直到没有紧靠着的重复字符为止。

  比如： abbaca => del, bb => aaca => del, aa => ca

  最终 =abbaca= 经过处理得到 =ca= 。

### *while* 循环版本

```js
const del = str => str.replace(/([a-z])\1{1,}/gi, '');

function rmDupsWithWhile(current) {
let last = ''
while (last !== current) {
last = current
current = del(current)
}

return current
}


console.time('Time')
console.log('result:', rmDupsWithWhile('abbaca'))
console.timeEnd('Time')
```

执行结果：

>: result: ca
>: Time: 3.740ms
>: undefined

原理含简单，就是不断的使用正则去重复替换掉重复的连续字符，直到最后 ~last === current~ 为止，

因为一旦没有重复连续字符了， =replace= 的结果都最终一样。

### 正则递归版本(尾调用未优化)

```js
const str = 'abbaca'

const del = s => s.replace(/([a-z])\1{1,}/gi, '')

function rmDupsWithRecursionNoOptimized(current, last) {

  if (last == current) return current

  last = current
  current = del(current)

  const res = rmDupsWithRecursionNoOptimized(current, last)
  // 不满足尾调用优化：未立即返回执行结果，非最后一个语句
  return res
}

console.time('Time')
const res = rmDupsWithRecursionNoOptimized(str)
console.timeEnd('Time')
console.log(res)
```

结果：

>: Time: 0.446ms
>: ca
>: undefined

### 正则递归版本(尾调用优化)

```js
const str = 'abbaca'

const del = s => s.replace(/([a-z])\1{1,}/gi, '')

function rmDupsWithRecursionOptimized(current, last) {

  if (last == current) return current

  last = current
  current = del(current)

  // 尾调用优化条件： 1. 立即返回结果，2. 无变量引用，3. 最后一行
  return rmDupsWithRecursionOptimized(current, last)
}

console.time('Time')
const res = rmDupsWithRecursionOptimized(str)
console.timeEnd('Time')
console.log(res)
```

结果：

>: Time: 0.463ms
>: ca
>: undefined