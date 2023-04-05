// https://insidethediv.com/javascript-simple-projects-with-source-code-frc-calculator

// const REG =
//   /^(?<neg>-?)(?<nan>(?:NaN)?)(?<inf>(?:Infinity)?)(?<int>\d*)[.,]?(?<frc>\d*)e?(?<exp>[-+]?\d*)n?$/i

const REG = /^(NaN)?([-]?)(Infinity)?(\d*)\.?(\d*)[eE]?([-+]?\d*)$/

const REG_ZERO = /^0+/

export type Raw = {
  isNaN: boolean
  isMinus: boolean
  isInfinity: boolean
  integer: string
  exponent: number
}

export function num2raw(s: number): Raw {
  const res = ((s = +s) !== 0 || 1 / s > 0 ? '' + s : '-0').match(REG)!

  return {
    isNaN     : !!res[1],
    isMinus   : res[2] === '-',
    isInfinity: !!res[3],
    integer   : (res[4] + res[5]).replace(REG_ZERO, ''),
    exponent  : +res[6] - res[5].length,
  }
}

export function raw2num(raw: Raw): number {
  return raw.isNaN ? NaN
    : raw.isInfinity ? raw.isMinus ? -Infinity : Infinity
      : +((raw.isMinus ? '-' : '') + (raw.integer || '0') + 'e' + raw.exponent)
}

//
// Exponentiation (**) … ** …
//
export function exp(l: number, r: number): number {
  l = +l, r = +r
  // console.log('exp', [l, r, l ** r])

  if (r === 0) return 1
  if (r !== r || l !== l) return NaN
  if (r === Infinity) {
    return !l ? 0 : l === -1 || l === 1 ? NaN : l > 1 || l < -1 ? r : 0
  }
  if (r === -Infinity) {
    return !l ? -r : l === -1 || l === 1 ? NaN : l > 1 || l < -1 ? 0 : -r
  }
  // if (l === 0 || r === -Infinity) return 0
  // if (l === Infinity || l === -Infinity) return l

  if (r < 0) l = div(1, l), r = -r
  
  let res = 1, i = 0
  for (;++i <= r;) res = mul(res, l)
  if ((r = add(r, 1 - i)) > 0) {
    res = mul(res, Math.pow(l, r))
    res = res === 0 ? 0 : res < 0 ? -res : res
  }
  return res
}

//
// Multiplication (*) … * …
//
export function mul(_l: number, _r: number): number {
  const l = num2raw(_l), r = num2raw(_r)
  // console.log('mul', _l * _r, { ...l }, { ...r })
  // const a = l.exponent + r.exponent
  // l.exponent = r.exp = 0
  // const c = num2raw(raw2num(l) * raw2num(r))
  // c.exponent += a
  // return raw2num(c)

  const le = l.exponent, re = r.exponent
  const a = (le > re ? re - le : le - re) || le
  l.exponent -= a, r.exponent -= a
  const c = num2raw(raw2num(l) * raw2num(r))
  c.exponent += a + a
  return raw2num(c)
}

//
// Division (/) … / …
//
export function div(_l: number, _r: number): number {
  const l = num2raw(_l), r = num2raw(_r)
  // console.log('div', _l / _r, { ...l }, { ...r })
  const le = l.exponent, re = r.exponent
  const a = (le > re ? re - le : le - re) || le
  l.exponent -= a, r.exponent -= a
  return raw2num(l) / raw2num(r)
}

//
// Remainder (%) … % …
//
export function rem(_l: number, _r: number): number {
  const l = num2raw(_l), r = num2raw(_r)
  // console.log('rem', _l % _r, { ...l }, { ...r })
  const le = l.exponent, re = r.exponent
  const a = (le > re ? re - le : le - re) || le
  l.exponent -= a, r.exponent -= a
  const c = num2raw(raw2num(l) % raw2num(r))
  c.exponent += a
  return raw2num(c)
}

//
// Addition (+) … + …
//
export function add(_l: number, _r: number): number {
  const l = num2raw(_l), r = num2raw(_r)
  // console.log('add', _l + _r, { ...l }, { ...r })
  const le = l.exponent, re = r.exponent
  const a = (le > re ? re - le : le - re) || le
  l.exponent -= a, r.exponent -= a
  const c = num2raw(raw2num(l) + raw2num(r))
  c.exponent += a
  return raw2num(c)
}

//
// Subtraction (-) … - …n
//
export function sub(_l: number, _r: number): number {
  return add(_l, -_r)
}
