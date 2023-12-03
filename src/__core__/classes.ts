import { concat, is_equal_with_zero } from './utils'

type INode = OperatorNode | ParenthesisNode | FunctionNode | ConstantNode | ConditionalNode

type MathLib = { [key: string]: any }
// type MathLibs = MathLib[] | IArguments

type ArrayFlat = string[] // | (string | ArrayFlat)[]

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

  toArray(isSafe?: boolean): ArrayFlat {
    return this.is ? this.is.toArray(isSafe) : ['NaN']
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

  toArray(isSafe?: boolean): ArrayFlat {
    const is = this.is
    const res = concat(is ? is.toArray(isSafe) : 'NaN')
    return isSafe && res[0] !== '(' ? concat('(', res, ')') : res
  }

  toString(): string {
    return '(' + (this.is || NaN) + ')'
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
    condition: INode | undefined,
  ) {
    this.type = 'Conditional'
    this.is = condition
    this.isTrue = trueExp
    this.isFalse = falseExp
  }

  toArray(isSafe?: boolean): ArrayFlat {
    const res = concat(
      this.is ? this.is.toArray(isSafe) : 'NaN',
      '?',
      this.isTrue ? this.isTrue.toArray(isSafe) : 'NaN',
      ':',
      this.isFalse ? this.isFalse.toArray(isSafe) : 'NaN',
    )
    return isSafe ? concat('(', res, ')') : res
  }

  toString(): string {
    return `${this.is || NaN} ? ${this.isTrue || NaN} : ${this.isFalse || NaN}`
  }

  calculate(...funcs: MathLib[]): any
  calculate(): any {
    const isBlock = this.is
    const isTrueBlock = this.isTrue
    const isFalseBlock = this.isFalse

    const a = arguments as any
    return isBlock ? isBlock.calculate.apply(isBlock, a) : NaN
      ? isTrueBlock ? isTrueBlock.calculate.apply(isTrueBlock, a) : NaN
      : isFalseBlock ? isFalseBlock.calculate.apply(isTrueBlock, a) : NaN
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

  toArray(): ArrayFlat {
    return [this.is]
  }

  toString(): string {
    return this.is
  }

  calculate(...funcs: MathLib[]): any
  calculate(): any {
    const is = this.is
    
    const a = arguments
    for (let i = a.length; i-- > 0;) {
      if (is in a[i] && typeof a[i][is] !== 'function') return a[i][is]
    }
    const isn = +is
    return isn === isn || is === 'NaN' ? isn : is
  }
}

//
// FunctionNode
//
function map_toArr(this: [boolean], v: INode, k: number): ArrayFlat {
  return k === 0 ? v.toArray(this[0]) : concat(',', v.toArray(this[0]))
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

  toArray(isSafe?: boolean): ArrayFlat {
    return concat(
      this.is, '(', concat.apply(void 0, this.isArgs.map(map_toArr, [isSafe])), ')'
    ) as any
  }

  toString(): string {
    return `${this.is}(${this.isArgs.join(', ')})`
  }

  calculate(...funcs: MathLib[]): any
  calculate(): any {
    const is = this.is

    const a = arguments
    for (let i = a.length; i-- > 0;) {
      if (is in a[i] && typeof a[i][is] === 'function') {
        return a[i][is].apply(void 0, this.isArgs.map(map_calculate, a))
      }
    }
    return NaN
  }
}

//
// OperatorNode
//
import {
  mul, div,
  rem,
  add, sub,
  exp
} from './algebra'
export class OperatorNode {
  type: 'Operator'
  is: string
  isLeft: INode | undefined
  isRight: INode | undefined
  constructor(
    operator: string,
    right: INode | undefined,
    left: INode | undefined,
  ) {
    this.type = 'Operator'
    this.is = operator
    this.isLeft = left
    this.isRight = right
  }

  toArray(isSafe?: boolean): ArrayFlat {
    const is = this.is
    const isLeftBlock = this.isLeft
    const isRightBlock = this.isRight

    const isLeft = isLeftBlock ? isLeftBlock.toArray(isSafe) : ['NaN']
    const isRight = isRightBlock ? isRightBlock.toArray(isSafe) : ['NaN']

    return (
      !isRightBlock
        ? isLeft
        : !isLeftBlock
          ? is === '!' || is === '~' || is === '-' ? concat(is, isRight) : isRight
          : is === '!' || is === '~' ? ['NaN'] : isSafe
            ? concat('(', isLeft, is, isRight, ')')
            : concat(isLeft, is, isRight)
    )
  }

  toString(): string {
    const is = this.is
    const isLeftBlock = this.isLeft
    const isRightBlock = this.isRight
    
    const isLeft = '' + (isLeftBlock || NaN)
    const isRight = '' + (isRightBlock || NaN)

    return (
      !isRightBlock
        ? isLeft
        : !isLeftBlock
          ? is === '!' || is === '~' || is === '-' ? is + isRight : isRight
          : is === '!' || is === '~' ? 'NaN' : isLeft + ' ' + is + ' ' + isRight
    )
  }

  calculate(...funcs: MathLib[]): any
  // eslint-disable-next-line consistent-return
  calculate(): any {
    const is = this.is
    const isLeftBlock = this.isLeft
    const isRightBlock = this.isRight

    const a = arguments as any
    const isLeft = isLeftBlock ? isLeftBlock.calculate.apply(isLeftBlock, a) : NaN
    const isRight = isRightBlock ? isRightBlock.calculate.apply(isRightBlock, a) : NaN

    if (!isRightBlock) {
      return isLeft
    }

    let fn!: Function

    for (let i = a.length; i-- > 0;) {
      if (is in a[i] && typeof a[i][is] === 'function') { fn = a[i][is]; break }
    }
    
    if (!isLeftBlock) {
      if (is === '-') return fn ? fn(0, isRight) : -isRight
      if (is === '!') return fn ? fn(isRight) : +!isRight
      if (is === '~') return fn ? fn(isRight) : ~isRight
      return isRight
    }

    if (fn) return fn(isLeft, isRight)
    // eslint-disable-next-line default-case
    switch (is) {
      // 14
      // case '!': return NaN
      // case '~': return NaN
      // 13
      case '**': return exp(isLeft, isRight)
      // 12
      case '*': return mul(isLeft, isRight)
      case '/': return div(isLeft, isRight)
      case '%': return rem(isLeft, isRight)
      // 11
      case '+': return add(isLeft, isRight)
      case '-': return sub(isLeft, isRight)
      // 10
      case '<<': return isLeft << isRight
      case '>>': return isLeft >> isRight
      case '>>>': return isLeft >>> isRight
      // 9
      case '<': return isLeft < isRight ? 1 : 0
      case '<=': return isLeft <= isRight ? 1 : 0
      case '>': return isLeft > isRight ? 1 : 0
      case '>=': return isLeft >= isRight ? 1 : 0
      // 8
      case '=':
      // eslint-disable-next-line eqeqeq, no-fallthrough
      case '==': return isLeft == isRight ? 1 : 0
      case '===': return is_equal_with_zero(isLeft, isRight) ? 1 : 0
      // eslint-disable-next-line eqeqeq
      case '!=': return isLeft != isRight ? 1 : 0
      case '!==': return is_equal_with_zero(isLeft, isRight) ? 0 : 1
      // 7
      case '&': return isLeft & isRight
      // 6
      case '^': return isLeft ^ isRight
      // 5
      case '|': return isLeft | isRight
      // 4
      case '&&': return isLeft ? isRight : isLeft
      // 3
      case '||': return isLeft ? isLeft : isRight
      case '??': return isLeft === isLeft ? isLeft : isRight
    }
    return NaN
  }
}
