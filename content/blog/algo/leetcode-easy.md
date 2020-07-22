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

> 基于leetcode的算法学习记录文章，使用语言主要是 JavaScript，可能会有少于C/Python实现，在没标明的情况下默认都是 JavaScript 实现。

# 数组分类

## [01. 数组中重复的数字](https://leetcode-cn.com/problems/shu-zu-zhong-zhong-fu-de-shu-zi-lcof/)

### 方案一： reduce + Object.keys + map + filter

下面这种方案适合于将所有重复的数字都找出来的案例，如果只需要找到第一个，该方案有多余的处理步骤，不建议使用。

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var findRepeatNumber = function (nums) {
  if (!Array.isArray(nums)) return []

  // 通过 reduce 得到 { val: times } 结果
  // 如果重复出现过 times > 0 否则 times === 0
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

  // 然后通过 keys, map 整理结果 times > 0 的值
  // 最后 filter 过滤掉 0 值得到的数组就是源数组中重复的数集合
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

### <span id="array-01-plan-2"></span>方案二: for

使用 for 语法，明显会比使用 reduce 快，因为它只要遇到重复的立即退出函数，而 reduce 版本无论什么时候都需要将数组所有元素遍历完，方案一更适合于查找

```js

var findRepeatNumber = function (nums) {
  if (!Array.isArray(nums)) return -1

  let res = {}
  for (let i = 0, len = nums.length; i < len; i++) {
    let k = nums[i] + "",
      v = res[k]

    if (res.hasOwnProperty(k)) {
      return k
    } else {
      res[k] = 0
    }
  }

  return -1
}
```

提交结果：

执行用时：88 ms, 在所有 JavaScript 提交中击败了57.41%的用户

内存消耗：43.1 MB, 在所有 JavaScript 提交中击败了100.00%的用户

| 提交时间 | 提交结果 | 运行时间                       | 内存消耗 | 语言       |
| :------- | :------- | :----------------------------- | :------- | :--------- |
| 几秒前   | 通过     | <font color="red">88 ms</font> | 43.1 MB  | Javascript |
| 3 分钟前 | 通过     | 104 ms                         | 43 MB    | Javascript |
| 1 天前   | 通过     | 152 ms                         | 51.9 MB  | Javascript |

### 方案三: 递归

**这个方法也可以通过，但效率上面感觉并没什么优势，并且这个方法找出的并不是第一个重复的元素。**

对比[方案二](#array-01-plan-2)：

1. 重复元素在中心点两边，同样需要遍历相同的次数才能找到这个重复元素(因为左边的递归必须先完成)
2. 重复元素在左边，左边递归次数和方案二循环次数是一样的
3. 重复元素在右边，左边必须递归完，右边的也必须递归直到两个重复元素出现(同方案一一样)

能否针对上面的情况进行优化(<font color="blur">考虑中心点两边同时进行比较，而不是等一边完成再处理另一边，那貌似就不适用递归了</font>)???

```js

findRepeatNumber = function _(nums, res = {}) {
  if (!Array.isArray(nums)) return -1 // 过滤掉非数组的情况

  let len = nums.length,
    mid = ~~(len / 2)

  const v = nums[0]
  const val = res[v]

  if (v !== void 0) { // 这里应该可以再优化下，空数组不应该会到这里
    res[v] = val >= 0 ? val + 1 : 0
    // console.log(v, "-------", res)
    if (res[v] > 0) {
      return v // 这里的返回值会被下面递归是的 x 变量接受
    }
  }

  let x = null
  if (mid > 0) {// 这里优化空数组情况，不应该继续往下分解了
    x = _(nums.slice(1, mid), res)
    if (x > -1) return x
    x = _(nums.slice(mid), res)
    if (x > -1) return x
  }

  return -1
}
```

执行用时：112 ms, 在所有 JavaScript 提交中击败了28.43%的用户

内存消耗：49.8 MB, 在所有 JavaScript 提交中击败了100.00%的用户

| 提交时间 | 提交结果 | 运行时间 | 内存消耗 | 语言       |
| :------- | :------- | :------- | :------- | :--------- |
| 几秒前   | 通过     | 112 ms   | 49.8 MB  | Javascript |
| 3 天前   | 通过     | 92 ms    | 45.5 MB  | Javascript |
| 3 天前   | 通过     | 104 ms   | 45.1 MB  | Javascript |
| 4 天前   | 通过     | 88 ms    | 43.1 MB  | Javascript |
| 4 天前   | 通过     | 104 ms   | 43 MB    | Javascript |
| 6 天前   | 通过     | 152 ms   | 51.9 MB  | Javascript |

### 方案四：二分 for

这个方案好处就是当两个数分布在中心点的两边的时候。

```js

findRepeatNumber = function _(nums) {
  if (!Array.isArray(nums)) return -1

  const len = nums.length
  const mid = ~~(len / 2)

  let res = {}
  for (let i = 0, j = mid + 1; i <= mid || j < len; i++, j++) {
    const v1 = nums[i]
    if (v1 !== void 0) {
      res[v1] = res[v1] === void 0 ? 0 : res[v1] + 1
    }
    if (res[v1] > 0) return v1

    const v2 = nums[j]
    if (v2 !== void 0) {
      res[v2] = res[v2] === void 0 ? 0 : res[v2] + 1
    }
    if (res[v2] > 0) return v2
  }

  return -1
}


```

结果好像并没啥优势，😅!!!

| 提交时间 | 提交结果 | 运行时间 | 内存消耗 | 语言       |
| :------- | :------- | :------- | :------- | :--------- |
| 几秒前   | 通过     | 104 ms   | 45.4 MB  | Javascript |
| 1 分钟前 | 通过     | 108 ms   | 45.6 MB  | Javascript |
| 1 分钟前 | 通过     | 116 ms   | 45.6 MB  | Javascript |
| 1 分钟前 | 通过     | 88 ms    | 45.7 MB  | Javascript |

### 其他方案(leetcoders)

其他 leetcode 上的方案，觉得有趣挺好的方案列表：

1. set.has 通过集合特性检测是否存在

   ```js
   findRepeatNumber = function _(nums) {
     let s = new Set()
     for (let i = 0, len = nums.length; i < len; i++) {
         const val = nums[i]
         // 这里还可以改造下，通过检测长度变化来做为退出条件
         if (s.has(val)) return val
         else s.add(val)
     }
     return -1
   }
   ```

## 02. [两数之和 II - 输入有序数组](https://leetcode-cn.com/problems/two-sum-ii-input-array-is-sorted/)

### <span id="array-02-plan-1"></span>方案一：两个for，O(n<sup>2</sup>)

这种方法最简单暴力，但是时间复杂度为 *O(n<sup>2</sup>)*

```js
// 最基本的遍历 O(n^2)
var twoSum = function(numbers, target) {
    let len = numbers.length
     for (let i = 0; i < len; i++) {
         for (let j = i + 1; j < len; j++) {
             if (numbers[i] + numbers[j] === target) {
                 return [i + 1, j + 1]
             }
         }
     }

     return -1
};
```

执行用时：444 ms, 在所有 JavaScript 提交中击败了5.30%的用户

内存消耗：38 MB, 在所有 JavaScript 提交中击败了10.00%的用户

| 提交时间 | 提交结果 | 运行时间 | 内存消耗 | 语言       |
| :------- | :------- | :------- | :------- | :--------- |
| 几秒前   | 通过     | 444 ms   | 38 MB    | Javascript |

该方案基础上可以做点优化，排除非法值。

```js
// 把上面的实现，领出来作为一个函数
function base(numbers, target) {
    let len = numbers.length
     for (let i = 0; i < len; i++) {
         for (let j = i + 1; j < len; j++) {
             if (numbers[i] + numbers[j] === target) {
                 return [i + 1, j + 1]
             }
         }
     }

     return []
}

// 这里加一层过滤。
// 过滤不合法的值，因为Numbers 是已排序的数组，所以 numbers[0] 肯定是最小的
// 通过和这个数相加如果大于 target 那肯定是不满足条件的元素，可以直接排除
// 时间复杂度依旧是 O(n^2)
var twoSum = function(numbers, target) {
    let len = numbers.length
    // 过滤掉不合法的值，比如：> target
    let n = -1, min = numbers[0]
    for (let i = 1; i < len; i++) {
        if (numbers[i] + min > target) {
            n = i
            break
        }
    }
    if (n > -1) {
        numbers = numbers.slice(0, n)
    }
    return base(numbers, target)
 }
```

这种优化只针对后面又大量的比 target 大的值的元素情况，否则几乎没任何改善。

执行用时：200 ms, 在所有 JavaScript 提交中击败了23.08%的用户

内存消耗：37.9 MB, 在所有 JavaScript 提交中击败了10.00%的用户

| 提交时间 | 提交结果 | 运行时间 | 内存消耗 | 语言       |
| :------- | :------- | :------- | :------- | :--------- |
| 几秒前   | 通过     | 200 ms   | 37.9 MB  | Javascript |

### 方案二: 排除 + 二分(*O(n<sup>2</sup>), O(1)*)

> 优化后的代码，依旧需要找出 midIdx，经过两次循环，时间复杂度为 O(n<sup>2</sup>)，过程中不需要开辟新的数组，完全是在索引上进行操作的，因此空间复杂度是 O(1)

这个方案是基于[方案一](#array-02-plan-1)实现，在它的基础上将数组二分之后做加法比较，因为遍历的是有序数组，在排除不合法的值之后(`min + max > target`的最大值)有效数字的索引是不会发生改变的。

<font color="blue">这个方案的重点在于二分，减少遍历的次数，最坏的情况是排除的时候没任何变化，即数组元素都是有效数字，且较小值在左侧末尾，较大值也在左侧末尾，这样会导致双层遍历都需要走完才能找到有效两个值。</font>

比如：[-1, 2, 3, 10, 12, 13] -> 16 经过两步

1. 排除较大值无变化
2. 二分数组成: `[-1, 2, 3]` 和 `[10, 12, 13]` 即要找到 3 + 13 = 16 就得将两个数组遍历到最后(3x3=9次)。

*写到这里会发现其实每次遍历并不需要都遍历完，考虑下将右边数字倒序遍历，那么就会有如果 leftval + rightval < target 的时候那么它之后的数都不可能等于 target 便可以退出本次循环，减少比较次数。*

比如： left = -1, right = 13 相加 < 16 那么 -1 + 12/10/... 都不可能等于 target 因此可以直接排除掉。

```js

// 取中间值，然后搜索左值和右值，需要开辟 两个数组空间总大小最大为 numbers.length
var twoSum = function (numbers, target) {
  numbers = filterLarger(numbers, target)

  const len = numbers.length
  const min = numbers[0],
    max = numbers[len - 1]
  // 目标的中间值作为基准，分割出左右小-大两个数组元素区
  const mid = Math.floor(target / 2)
  let midIdx = -1
  // 找出大值起始索引
  for (let i = 0; i < len; i++) {
    const val = numbers[i]
    if (val > mid) {
      midIdx = i
      break
    } else if (val === mid) {
      midIdx = i + 1
      break
    }
  }

  //console.log({ mid, midIdx }, numbers)
  // 如果 midIdx === -1 说明有两种情况：
  // 1. 余下的元素都是比 mid 小的数，这种情况就不会存在两个数相加等于 target
  // 2. 余下的元素都是等于 mid 的数，这个时候可能性只有 mid 为 0情况
  if (midIdx === -1) {
    if (target === 0) {
      // q2
      // 这种情况只要找出两个值为 0 的元素索引
      let res = []
      for (let i = 0; i < len; i++) {
        if (res.length < 2) {
          numbers[i] === 0 && res.push(i + 1)
        }
        if (res.length === 2) {
          return res
        }
      }
    } else {
      // q1
      return -1
    }
  }

  // 到这里说明 midIdx > -1，两边都有值且一大一小

  let count = 0
  for (let i = 0; i < midIdx; i++) {
    // 较小数
    for (let j = midIdx; j < len; j++) {
      ++count
      // 较大数
      if (numbers[i] + numbers[j] === target) {
        console.log(count, "two sum 1")
        return [i + 1, j + 1]
      }
    }
  }

  return -1
}
```

上面示例提交结果：

> 执行用时：96 ms, 在所有 JavaScript 提交中击败了28.05%的用户
>
> 内存消耗：38.3 MB, 在所有 JavaScript 提交中击败了10.00%的用户

根据上面的分析，进一步优化，使第二个 for 倒序遍历，减少遍历次数：

```js

// 取中间值，然后搜索左值和右值，需要开辟 两个数组空间总大小最大为 numbers.length
var twoSum2 = function (numbers, target) {
  numbers = filterLarger(numbers, target)

  const len = numbers.length
  const min = numbers[0],
    max = numbers[len - 1]
  // 目标的中间值作为基准，分割出左右小-大两个数组元素区
  const mid = Math.floor(target / 2)
  let midIdx = -1
  // 找出大值起始索引
  for (let i = 0; i < len; i++) {
    const val = numbers[i]
    if (val > mid) {
      midIdx = i
      break
    } else if (val === mid) {
      midIdx = i + 1
      break
    }
  }

  //console.log({ mid, midIdx }, numbers)
  // 如果 midIdx === -1 说明有两种情况：
  // 1. 余下的元素都是比 mid 小的数，这种情况就不会存在两个数相加等于 target
  // 2. 余下的元素都是等于 mid 的数，这个时候可能性只有 mid 为 0情况
  if (midIdx === -1) {
    if (target === 0) {
      // q2
      // 这种情况只要找出两个值为 0 的元素索引
      let res = []
      for (let i = 0; i < len; i++) {
        if (res.length < 2) {
          numbers[i] === 0 && res.push(i + 1)
        }
        if (res.length === 2) {
          return res
        }
      }
    } else {
      // q1
      return -1
    }
  }

  // 到这里说明 midIdx > -1，两边都有值且一大一小

  let count = 0
  for (let i = 0; i < midIdx; i++) {
    // 较小数
    for (let j = len - 1; j >= midIdx; j--) {
      const lval = numbers[i],
        rval = numbers[j]
      ++count
      if (lval + rval < target) {
        // 直接退出 j 循环
        break
      }
      // 较大数
      if (lval + rval === target) {
        console.log(count, "two sum 2")
        return [i + 1, j + 1]
      }
    }
  }

  return -1
}
```

测试：

```js
console.log(twoSum([-1, 2, 3, 10, 12, 13], 16), "result1")
console.log(twoSum2([-1, 2, 3, 10, 12, 13], 16), "result2")
// 输出结果:
➜  algo git:(master) ✗ node test.js
node test.js
9 two sum 1
[ 3, 6 ] result1
3 two sum 2
[ 3, 6 ] result2
➜  algo git:(master) ✗ 
```

从上结果看出，优化之前 count = 9，优化之后 count = 3，很明显大大减少了遍历次数。

提交结果1：

>执行用时：96 ms, 在所有 JavaScript 提交中击败了28.05%的用户
>
>内存消耗：38.1 MB, 在所有 JavaScript 提交中击败了10.00%的用户

提交结果2：

> 执行用时：76 ms, 在所有 JavaScript 提交中击败了51.90%的用户
>
> 内存消耗：38.1 MB, 在所有 JavaScript 提交中击败了10.00%的用户

提交多次后的结果：

| 提交时间  | 提交结果 | 运行时间 | 内存消耗 | 语言       |
| :-------- | :------- | :------- | :------- | :--------- |
| 几秒前    | 通过     | 76 ms    | 38.5 MB  | Javascript |
| 几秒前    | 通过     | 92 ms    | 38.1 MB  | Javascript |
| 1 分钟前  | 通过     | 76 ms    | 38.1 MB  | Javascript |
| 1 分钟前  | 通过     | 96 ms    | 38.1 MB  | Javascript |
| 26 分钟前 | 通过     | 96 ms    | 38.3 MB  | Javascript |

PS：结果好像并没什么改善，使用双层循环始终不完美，能否只是用一个层循环就能解决问题呢？？？

### 方案三：计算，存储差值方式(*O(n), O(n)*)

差值计算原理

1. 缓存不满足条件的值(作为索引)，其索引作为值，用来待查询
2. 使用插值作为索引去取值，能取到说明这个值被遍历且被存储去，属于有
   效值，最终返回其作为索引对应的值(即它的索引值)，和当前的值索引，即
   最后满足条件的两个值的索引

```js

var twoSum = function (numbers, target) {
  // 这里可以左一层过滤，过滤掉非法的值
  // numbers = filterLarger(numbers, target)

  const deltas = []
  const len = numbers.length
  for (let i = 0; i < len; i++) {
    const val = numbers[i] // 记录当前的值 
    const delta = target - numbers[i] // 计算差值
    if (deltas[delta] !== void 0) {
      // 进入这里说明当前值的差值在 deltas 中存在过
      return [deltas[delta] + 1, i + 1]
    }
    // 保存当前值和它的索引
    // 这里保存的目的是为了使用上面的 delta 走位索引来找差值
    // 到这里说明并没有找到对应的差值
    deltas[val] = i 
  }

  //console.log(deltas, "0")
  return -1
}
```

使用数组存储遍历过待比较的值会有个问题，如果这些值很大的时候，会创建一个长度很大的里面有很多空置的数组，也就是说会创建一个包含很多无意义元素的数组，在某种情况下对浪费巨大的内存。

<font color="blue">搞清楚我们要存储的内容，其实最主要的是满足条件的两个值的索引，而又需要很方便的找到这个值，其实可以考虑使用 `Map` 来实现。</font>

比如：

```js

// 插值 + map 减少空间浪费
var twoSum = function (numbers, target) {
  // 可以过滤一层不合法值
  // numbers = filterLarger(numbers, target)

  const deltas = new Map()
  const len = numbers.length
  for (let i = 0; i < len; i++) {
    const val = numbers[i]
    const delta = target - numbers[i]
    if (deltas.has(delta)) {
      return [deltas.get(delta) + 1, i + 1]
    }
    // 保存当前值和它的索引
    deltas.set(val, i)
  }

  // console.log(deltas, "0")
  return -1
}
```

**执行结果：好像也不怎么理想**

执行用时：84 ms, 在所有 JavaScript 提交中击败了36.05%的用户

内存消耗：38.1 MB, 在所有 JavaScript 提交中击败了10.00%的用户

| 提交时间 | 提交结果 | 运行时间 | 内存消耗 | 语言       |
| :------- | :------- | :------- | :------- | :--------- |
| 几秒前   | 通过     | 84 ms    | 38.1 MB  | Javascript |
| 1 分钟前 | 通过     | 92 ms    | 38.1 MB  | Javascript |

### <span id="array-02-plan-4"></span>方案四: 对撞双指针

这种方案是在 leetcode 解题答案中看到的，这位作者说是击败 80%，但实际我试过几次结果其实并不理想，

> 执行用时：92 ms, 在所有 JavaScript 提交中击败了29.67%的用户
>
> 内存消耗：37.9 MB, 在所有 JavaScript 提交中击败了10.00%的用户

上代码：

```js

// 对撞双指针
var twoSum = function (numbers, target) {
  let i = 0,
    j = numbers.length - 1

  let lval = -1,
    rval = -1
  while (i < j) {
    ;(lval = numbers[i]), (rval = numbers[j])
    if (lval + rval < target) {
      i++
    } else if (lval + rval > target) {
      j--
    } else {
      return [i + 1, j + 1]
    }
  }

  return -1
}
```

这种方案还是比较好理解的，因为是有序数组，所以：

1. 只要两个数小于 target 说明需要增加值大小，由于 j 是从最右边开始没有可加空间了，那么只能 i++ 取新的更大的值去弥补空缺。
2. 只要两个数大于 target 说明需要减小和的值，但由于在此时左边的值也没减小的空间了，因此只能 j-- 取新的更小的值去剔除多余的值

### 官方方案

#### 二分查找(O(nlogn), O(1))

先用第一层的 for 固定第一个数，然后在 for 里面使用 while 二分查找第二个数，第一个for 是 O(n) 第二个 while 是 logn 因此最后的时间复杂度是 (O(nlogn))。

```js

// 二分法[官方]
var twoSum = function (numbers, target) {
  let len = numbers.length

  for (let i = 0; i < len; i++) {
    const first = numbers[i]
    let left = 0,
      right = len - 1

    while (left <= right) {
      // 取中间的那个索引值
      const mid = Math.ceil((right - left) / 2) + left

      const val = numbers[mid],
        delta = target - first
      if (val === delta) {
        return [i + 1, mid + 1]
      } else if (val > delta) {
        // 如果值大了，排除 mid 右边的所有元素值
        right = mid - 1
      } else {
        // 如果小了，排除 mid 左边的所有元素值
        left = mid + 1
      }
    }
  }

  return -1
}
```

这种方案，不需要另开辟空间，while 里面是 logn 是因为将第一个数右边的所有数通过不断二分排除左边或右边一系列不合法的值。

实测结果：

>执行用时：80 ms, 在所有 JavaScript 提交中击败了41.01%的用户
>
>内存消耗：38 MB, 在所有 JavaScript 提交中击败了10.00%的用户

#### [对撞双指针法](#array-02-plan-4)(O(n), O(1))

如：[方案四](#array-02-plan-4)，采用两端指针分别右移和左移方式来定位唯一解，这种方案在位移过程中不会出现过滤掉唯一解的情况，因为头端右移的前提是 value < target，需要补值(就算尾端先达到条件，只要值小尾端就不会发生位移)，尾端左移前提是 value > target ，需要减值(就算头端先达到条件，只要值大于尾端就不会发生位移)，因此保证了左右两端任一一端先达到符合条件的值该值都不会被过滤掉，从而当两端值都满足条件的时候退出循环。

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