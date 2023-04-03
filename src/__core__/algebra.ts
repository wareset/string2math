// https://insidethediv.com/javascript-simple-projects-with-source-code-frc-calculator

// const REG =
//   /^(?<neg>-?)(?<nan>(?:NaN)?)(?<inf>(?:Infinity)?)(?<int>\d*)[.,]?(?<frc>\d*)e?(?<exp>[-+]?\d*)n?$/i

const REG =
  /^([-]?)((?:NaN)?)((?:Infinity)?)(\d*)[.,]?(\d*)e?([-+]?\d*)n?$/i

const REG_ZERO = /^0+/

export type Raw = {
  nan: boolean
  neg: boolean
  inf: boolean
  int: string
  exp: number
}

export function num2raw(s: number): Raw {
  const res = (+s + '').match(REG)!//.groups as any

  // const int = res.int
  // const frc = res.frc

  // res.nan = !!res.nan
  // res.neg = res.neg === '-'
  // res.inf = !!res.inf
  // res.int = (int + frc).replace(REG_ZERO, '')
  // res.exp = +res.exp - frc.length
  // delete res.frc
  return {
    neg: res[1] === '-',
    nan: !!res[2],
    inf: !!res[3],
    int: (res[4] + res[5]).replace(REG_ZERO, ''),
    exp: +res[6] - res[5].length,
  }
}

export function raw2num(raw: Raw): number {
  return raw.nan ? NaN
    : raw.inf ? raw.neg ? -Infinity : Infinity
      : raw.neg
        ? -((raw.int || '0') + 'e' + raw.exp)
        : +((raw.int || '0') + 'e' + raw.exp)
}

//
// Exponentiation (**) … ** …
//
export function exp(l: number, r: number): number {
  if (r === 0) return 1
  if (r !== r || l !== l) return NaN
  if (r === Infinity) return r
  if (l === 0 || r === -Infinity) return 0
  if (l === Infinity || l === -Infinity) return l

  if (r < 0) l = div(1, l), r = -r
  let res = 1, i = 0
  for (;++i <= r;) res = mul(res, l)
  // if ((r = add(r, 1 - i)) > 0) res = mul(res, raw2num(num2raw(Math.pow(l, r))))
  if ((r = add(r, 1 - i)) > 0) res = mul(res, Math.pow(l, r))
  return res
}

//
// Multiplication (*) … * …
//
export function mul(_l: number, _r: number): number {
  const l = num2raw(_l), r = num2raw(_r)
  // console.log('mul', _l * _r, { ...l }, { ...r })
  // const a = l.exp + r.exp
  // l.exp = r.exp = 0
  // const c = num2raw(raw2num(l) * raw2num(r))
  // c.exp += a
  // return raw2num(c)

  const le = l.exp, re = r.exp
  const a = (le > re ? re - le : le - re) || le
  l.exp -= a, r.exp -= a
  const c = num2raw(raw2num(l) * raw2num(r))
  c.exp += a + a
  return raw2num(c)
}

//
// Division (/) … / …
//
export function div(_l: number, _r: number): number {
  const l = num2raw(_l), r = num2raw(_r)
  // console.log('div', _l / _r, { ...l }, { ...r })
  const le = l.exp, re = r.exp
  const a = (le > re ? re - le : le - re) || le
  l.exp -= a, r.exp -= a
  return raw2num(l) / raw2num(r)
}

//
// Remainder (%) … % …
//
export function rem(_l: number, _r: number): number {
  const l = num2raw(_l), r = num2raw(_r)
  // console.log('rem', _l % _r, { ...l }, { ...r })
  const le = l.exp, re = r.exp
  const a = (le > re ? re - le : le - re) || le
  l.exp -= a, r.exp -= a
  const c = num2raw(raw2num(l) % raw2num(r))
  c.exp += a
  return raw2num(c)
}

//
// Addition (+) … + …
//
export function add(_l: number, _r: number): number {
  const l = num2raw(_l), r = num2raw(_r)
  // console.log('add', _l + _r, { ...l }, { ...r })
  const le = l.exp, re = r.exp
  const a = (le > re ? re - le : le - re) || le
  l.exp -= a, r.exp -= a
  const c = num2raw(raw2num(l) + raw2num(r))
  c.exp += a
  return raw2num(c)
}

//
// Subtraction (-) … - …n
//
export function sub(_l: number, _r: number): number {
  return add(_l, -_r)
}
