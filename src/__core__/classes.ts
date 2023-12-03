import { concat, arrayConcat } from './utils'

type INode = OperatorNode | GroupingNode | FunctionNode | ConstantNode | TernaryNode

type MathLib = { [key: string]: any }
// type MathLibs = MathLib[] | IArguments

type ToArray = string[] // | (string | ToArray)[]

function toArr(node: INode | undefined) {
  return node ? node.toArray() : ['NaN']
}

function calc(node: INode | undefined, fns: any) {
  return node ? node.calculate(fns) : NaN
}

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
    return toArr(this.is)
  }

  toString(): string {
    return '' + (this.is || NaN)
  }

  calculate(fns?: MathLib[]): any {
    return calc(this.is, fns)
  }
}

//
// GroupingNode
//
export class GroupingNode {
  type: 'Grouping'
  is: INode | undefined
  constructor(data: INode | undefined) {
    this.type = 'Grouping'
    this.is = data
  }

  toArray(): ToArray {
    return toArr(this.is)
  }

  toString(): string {
    return '' + (this.is || NaN)
  }

  calculate(fns?: MathLib[]): any {
    return calc(this.is, fns)
  }
}

//
// TernaryNode
//
export class TernaryNode {
  type: 'Ternary'
  is: INode | undefined
  isTrue: INode | undefined
  isFalse: INode | undefined
  constructor(
    falseExp: INode | undefined,
    trueExp: INode | undefined,
    condition: INode | undefined
  ) {
    this.type = 'Ternary'
    this.is = condition
    this.isTrue = trueExp
    this.isFalse = falseExp
  }

  toArray(): ToArray {
    return concat('(', toArr(this.is), '?', toArr(this.isTrue), ':', toArr(this.isFalse), ')')
  }

  toString(): string {
    return `(${this.is || NaN} ? ${this.isTrue || NaN} : ${this.isFalse || NaN})`
  }

  calculate(fns?: MathLib[]): any {
    return calc(this.is, fns) ? calc(this.isTrue, fns) : calc(this.isFalse, fns)
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

  calculate(fns?: MathLib[]): any {
    const is = this.is

    if (fns)
      for (let i = fns.length, v; i-- > 0; ) {
        if (is in (v = fns[i]) && typeof (v = v[is]) !== 'function') return v
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
  return v.calculate(this)
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
    return concat(this.is + '(', arrayConcat.apply([], this.isArgs.map(map_toArr)), ')')
  }

  toString(): string {
    return `${this.is}(${this.isArgs.join(', ')})`
  }

  calculate(fns?: MathLib[]): any {
    const is = this.is

    if (fns)
      for (let i = fns.length, v; i-- > 0; ) {
        if (is in (v = fns[i]) && typeof (v = v[is]) === 'function') {
          return v.apply(void 0, this.isArgs.map(map_calculate, fns))
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

    const vLeft = toArr(isLeft)
    const vRight = toArr(isRight)

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

  calculate(fns?: MathLib[]): any {
    const is = this.is
    const isLeft = this.isLeft
    const isRight = this.isRight

    let vLeft = calc(isLeft, fns)
    let vRight = calc(isRight, fns)

    if (!isRight) return vLeft

    let fn!: Function
    if (fns)
      for (let i = fns.length, v; i-- > 0; ) {
        if (is in (v = fns[i]) && typeof (v = v[is]) === 'function') {
          fn = v
          break
        }
      }

    if (!isLeft) {
      switch (is) {
        // 14
        case '!':
          return fn ? fn(vRight) : +!+vRight
        case '~':
          return fn ? fn(vRight) : ~+vRight
        case '+':
          return fn ? fn(null, vRight) : +vRight
        case '-':
          return fn ? fn(null, vRight) : -+vRight
      }
      return vRight
    }

    if (fn) return fn(vLeft, vRight)

    vLeft = +vLeft
    vRight = +vRight
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
        return vLeft + vRight // add(vLeft, vRight)
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
