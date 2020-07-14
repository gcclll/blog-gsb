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

console.log(findRepeatNumber([2, 3, 1, 0, 2, 5, 3]))
