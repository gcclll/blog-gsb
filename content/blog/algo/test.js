/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */

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

// 过滤掉非法的大值
function filterLarger(numbers, target) {
  let len = numbers.length
  // 过滤掉不合法的值，比如：> target
  let n = -1,
    min = numbers[0],
    max = numbers[len - 1]
  for (let i = 1; i < len; i++) {
    if (numbers[i] + min > target) {
      n = i
      break
    }
  }
  if (n > -1) {
    numbers = numbers.slice(0, n)
  }
  return numbers
}

// 最基本的遍历 O(n^2)
var twoSum = function (numbers, target) {
  return base(numbers, target)
}
// 过滤不合法的值，因为Numbers 是已排序的数组，所以 numbers[0] 肯定是最小的
// 通过和这个数相加如果大于 target 那肯定是不满足条件的元素，可以直接排除
// 时间复杂度依旧是 O(n^2)
var twoSum = function (numbers, target) {
  numbers = filterLarger(numbers, target)
  return base(numbers, target)
}

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

// 差值计算原理
// 1. 缓存不满足条件的值(作为索引)，其索引作为值，用来待查询
// 2. 使用插值作为索引去取值，能取到说明这个值被遍历且被存储去，属于有
// 效值，最终返回其作为索引对应的值(即它的索引值)，和当前的值索引，即
// 最后满足条件的两个值的索引
var twoSum = function (numbers, target) {
  // 可以过滤一层不合法值
  // numbers = filterLarger(numbers, target)

  const deltas = []
  const len = numbers.length
  for (let i = 0; i < len; i++) {
    const val = numbers[i]
    const delta = target - numbers[i]
    if (deltas[delta] !== void 0) {
      return [deltas[delta] + 1, i + 1]
    }
    // 保存当前值和它的索引
    deltas[val] = i
  }

  // console.log(deltas, "0")
  return -1
}

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

// console.log(twoSum([-1, 2, 3, 10, 12, 13], 16), "result1")
//console.log(twoSum2([-1, 2, 3, 10, 12, 13], 16), "result2")
