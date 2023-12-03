import { concat } from './utils'

type INode = OperatorNode | ParenthesisNode | FunctionNode | ConstantNode | ConditionalNode

type MathLib = { [key: string]: any }
// type MathLibs = MathLib[] | IArguments

type ToArray = string[] // | (string | ToArray)[]

// Program
// Constant
// Function
// Grouping
// Operator
// Brackets
// Conditional
// Ternary

//
// ProgramNode
//
export class ProgramNode {
  type: 'Program'
  is: INode | undefined
  constructor(data: INode | undefined) {
    this.type = 'Program'
    this.is = data
  }

  toArray(): ToArray {
    return this.is ? this.is.toArray() : ['NaN']
  }

  toString(): string {
    return '' + (this.is || NaN)
  }

  calculate(...funcs: MathLib[]): any
  calculate(): any {
    return this.is ? this.is.calculate.apply(this.is, arguments as any) : NaN
  }
}

//
// ParenthesisNode
//
export class ParenthesisNode {
  type: 'Parenthesis'
  is: INode | undefined
  constructor(data: INode | undefined) {
    this.type = 'Parenthesis'
    this.is = data
  }

  toArray(): ToArray {
    return this.is ? this.is.toArray() : ['NaN']
  }

  toString(): string {
    return '' + (this.is || NaN)
  }

  calculate(...funcs: MathLib[]): any
  calculate(): any {
    return this.is ? this.is.calculate.apply(this.is, arguments as any) : NaN
  }
}

//
// ConditionalNode
//
export class ConditionalNode {
  type: 'Conditional'
  is: INode | undefined
  isTrue: INode | undefined
  isFalse: INode | undefined
  constructor(
    falseExp: INode | undefined,
    trueExp: INode | undefined,
    condition: INode | undefined
  ) {
    this.type = 'Conditional'
    this.is = condition
    this.isTrue = trueExp
    this.isFalse = falseExp
  }

  toArray(): ToArray {
    return concat(
      '(',
      this.is ? this.is.toArray() : 'NaN',
      '?',
      this.isTrue ? this.isTrue.toArray() : 'NaN',
      ':',
      this.isFalse ? this.isFalse.toArray() : 'NaN',
      ')'
    )
  }

  toString(): string {
    return `(${this.is || NaN} ? ${this.isTrue || NaN} : ${this.isFalse || NaN})`
  }

  calculate(...funcs: MathLib[]): any
  calculate(): any {
    const is = this.is
    const isTrue = this.isTrue
    const isFalse = this.isFalse

    const a = arguments as any
    // prettier-ignore
    return is ? is.calculate.apply(is, a) : NaN
      ? isTrue ? isTrue.calculate.apply(isTrue, a) : NaN
      : isFalse ? isFalse.calculate.apply(isTrue, a) : NaN
  }
}

//
// ConstantNode
//
export class ConstantNode {
  type: 'Constant'
  is: string
  constructor(a: string) {
    this.type = 'Constant'
    this.is = a
  }

  toArray(): ToArray {
    return [this.is]
  }

  toString(): string {
    return '' + this.is
  }

  calculate(...funcs: MathLib[]): any
  calculate(): any {
    const is = this.is

    const a = arguments
    for (let i = a.length, v; i-- > 0; ) {
      if (is in (v = a[i]) && typeof (v = v[is]) !== 'function') return v
    }
    const v = +is
    return v === v || is === 'NaN' ? v : is
  }
}

//
// FunctionNode
//
function map_toArr(v: INode, k: number): ToArray {
  return k === 0 ? v.toArray() : concat(',', v.toArray())
}
function map_calculate(this: MathLib[], v: INode): number {
  return v.calculate.apply(v, this)
}
export class FunctionNode {
  type: 'Function'
  is: string
  isArgs: INode[]
  constructor(a: string, args: INode[]) {
    this.type = 'Function'
    this.is = a as any
    this.isArgs = args
  }

  toArray(): ToArray {
    return concat(this.is + '(', concat.apply(void 0, this.isArgs.map(map_toArr)), ')') as any
  }

  toString(): string {
    return `${this.is}(${this.isArgs.join(', ')})`
  }

  calculate(...funcs: MathLib[]): any
  calculate(): any {
    const is = this.is

    const a = arguments
    for (let i = a.length, v; i-- > 0; ) {
      if (is in (v = a[i]) && typeof (v = v[is]) === 'function') {
        return v.apply(void 0, this.isArgs.map(map_calculate, a))
      }
    }
    return NaN
  }
}

//
// OperatorNode
//
// import { mul, div, rem, add, sub, exp } from './algebra'
export class OperatorNode {
  type: 'Operator'
  is: string
  isLeft: INode | undefined
  isRight: INode | undefined
  constructor(operator: string, right: INode | undefined, left: INode | undefined) {
    this.type = 'Operator'
    this.is = operator
    this.isLeft = left
    this.isRight = right
  }

  toArray(): ToArray {
    const is = this.is
    const isLeft = this.isLeft
    const isRight = this.isRight

    const vLeft = isLeft ? isLeft.toArray() : ['NaN']
    const vRight = isRight ? isRight.toArray() : ['NaN']

    // prettier-ignore
    return !isRight ? vLeft : !isLeft
      ? is === '!' || is === '~' || is === '-' ? concat(is, vRight) : vRight
      : is === '!' || is === '~' ? ['NaN'] : concat('(', vLeft, is, vRight, ')')
  }

  toString(): string {
    const is = this.is
    const isLeft = this.isLeft
    const isRight = this.isRight

    const vLeft = '' + (isLeft || NaN)
    const vRight = '' + (isRight || NaN)

    // prettier-ignore
    return !isRight ? vLeft : !isLeft
      ? is === '!' || is === '~' || is === '-' ? is + vRight : vRight
      : is === '!' || is === '~' ? 'NaN' : `(${vLeft} ${is} ${vRight})`
  }

  calculate(...funcs: MathLib[]): any
  // eslint-disable-next-line consistent-return
  calculate(): any {
    const is = this.is
    const isLeft = this.isLeft
    const isRight = this.isRight

    const a = arguments as any
    const vLeft = isLeft ? isLeft.calculate.apply(isLeft, a) : NaN
    const vRight = isRight ? isRight.calculate.apply(isRight, a) : NaN

    if (!isRight) {
      return vLeft
    }

    let fn!: Function
    for (let i = a.length, v; i-- > 0; ) {
      if (is in (v = a[i]) && typeof (v = v[is]) === 'function') {
        fn = v
        break
      }
    }

    if (!isLeft) {
      if (is === '-') return fn ? fn(0, vRight) : -vRight
      if (is === '!') return fn ? fn(vRight) : +!vRight
      if (is === '~') return fn ? fn(vRight) : ~vRight
      return vRight
    }

    if (fn) return fn(vLeft, vRight)
    // eslint-disable-next-line default-case
    switch (is) {
      // 14
      // case '!': return NaN
      // case '~': return NaN
      // 13
      case '**':
        return Math.pow(vLeft, vRight) // exp(vLeft, vRight)
      // 12
      case '*':
        return vLeft * vRight // mul(vLeft, vRight)
      case '/':
        return vLeft / vRight // div(vLeft, vRight)
      case '%':
        return vLeft % vRight // rem(vLeft, vRight)
      // 11
      case '+':
        return +(vLeft + vRight) // add(vLeft, vRight)
      case '-':
        return vLeft - vRight // sub(vLeft, vRight)
      // 10
      case '<<':
        return vLeft << vRight
      case '>>':
        return vLeft >> vRight
      case '>>>':
        return vLeft >>> vRight
      // 9
      case '<':
        return vLeft < vRight ? 1 : 0
      case '<=':
        return vLeft <= vRight ? 1 : 0
      case '>':
        return vLeft > vRight ? 1 : 0
      case '>=':
        return vLeft >= vRight ? 1 : 0
      // 8
      case '=':
      case '==':
        return vLeft == vRight ? 1 : 0
      case '===':
        return vLeft === vRight ? 1 : 0
      case '!=':
        return vLeft != vRight ? 1 : 0
      case '!==':
        return vLeft !== vRight ? 1 : 0
      // 7
      case '&':
        return vLeft & vRight
      // 6
      case '^':
        return vLeft ^ vRight
      // 5
      case '|':
        return vLeft | vRight
      // 4
      case '&&':
        return vLeft ? vRight : vLeft
      // 3
      case '||':
        return vLeft ? vLeft : vRight
      case '??':
        return vLeft === vLeft ? vLeft : vRight
    }
    return NaN
  }
}
