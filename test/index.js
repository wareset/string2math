const { add, sub, mul, div, rem, exp } = require('../index.js')

const _add = (a, b) => a + b
const _sub = (a, b) => a - b
const _mul = (a, b) => a * b
const _div = (a, b) => a / b
const _rem = (a, b) => a % b
const _exp = (a, b) => a ** b

const FNS = [add, sub, mul, div, rem, exp]
const _FNS = [_add, _sub, _mul, _div, _rem, _exp]
const N_FNS = ['add', 'sub', 'mul', 'div', 'rem', 'exp']

const NUMS = [-0, -0.5, -1, -1.5, -2, -3, -4, -(2 ** 3), -(2 ** 4), 0, 0.5, 1, 1.5, 2, 3, 4, 2 ** 3, 2 ** 4, NaN, Infinity, -Infinity]

const ACCURACY = 12

for (let i = 0; i < NUMS.length; i++) {
  for (let j = 0; j < NUMS.length; j++) {
    for (let f = 0; f < FNS.length; f++) {
      const v = FNS[f](NUMS[i], NUMS[j])
      const _v = _FNS[f](NUMS[i], NUMS[j])
      if (!Object.is(v ? v.toFixed(ACCURACY) : v, _v ? _v.toFixed(ACCURACY) : _v)) {
        console.log(N_FNS[f], [NUMS[i], NUMS[j]], [v, _v])
      }
    }
  }
}
