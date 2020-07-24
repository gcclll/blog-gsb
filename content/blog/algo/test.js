/**
 * @param {number[]} numbers
 * @return {number}
 */
var minArray = function (numbers) {
  let min = numbers[0],
    len = numbers.length
  if (len === 0) return -1
  if (len < 2) return min

  for (let i = 1; i < len; i++) {
    let val = numbers[i]
    if (val < min) {
      return val
    }
  }
  return min
}

var minArray = function (numbers) {
  let min = numbers[0],
    len = numbers.length
  if (len === 0) return -1
  if (len < 2) return min

  let start = 0,
    end = len - 1
  while (start < end) {
    let mid = Math.ceil((end - start) / 2) + start
    let midVal = numbers[mid]
    let lval = numbers[mid - 1],
      rval = numbers[mid + 1]
    if (lval < midVal) {
      end = mid - 1
    } else if (rval > midVal) {
      start = mid + 1
    }

    if (lval > midVal) {
      return midVal
    }
  }

  // console.log({ start, end })
  if (start === end) {
    return numbers[start]
  }

  return -1
}

// console.log(minArray([1, 3, 5]))
