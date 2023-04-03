import { concat, last } from './utils'

// |\[[^\]]*\]
const REG =
  /\?\??|\|\|?|\*\*?|&&?|<<|>>>?|[!=]=?=?|[<>]=?|(?<!\d\.?[eE])[-+]|[,:~^%/()[\]]/g

// Program
// Constant
// Function
// Grouping
// Operator
// Brackets
// Conditional
// Ternary

type INode = OperatorNode | ParenthesisNode | FunctionNode | ConstantNode | ConditionalNode

type MathLib = { [key: string]: any }

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

  // get string(): string {
  //   return this.toString()
  // }

  // toString(): string {
  //   return '' + this.is
  // }

  calc(...funcs: MathLib[]): number
  calc(): number {
    return this.is ? this.is.calc(arguments) : NaN
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

  // toString(): string {
  //   return '(' + ('' + this.is).trim() + ')'
  // }

  calc(...funcs: MathLib[]): number
  calc(): number {
    return this.is ? this.is.calc(arguments) : NaN
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

  // toString(): string {
  //   const is = ('' + this.is).trim()
  //   const isTrue = ('' + this.isTrue).trim()
  //   const isFalse = ('' + this.isFalse).trim()
  //   return `${is} ? ${isTrue} : ${isFalse}`
  // }

  calc(...funcs: MathLib[]): number
  calc(): number {
    const isBlock = this.is
    const isTrueBlock = this.isTrue
    const isFalseBlock = this.isFalse

    const a = arguments
    return isBlock ? isBlock.calc(a) : NaN
      ? isTrueBlock ? isTrueBlock.calc(a) : NaN
      : isFalseBlock ? isFalseBlock.calc(a) : NaN
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

  // toString(): string {
  //   return this.is
  // }

  calc(...funcs: MathLib[]): number
  calc(): number {
    const is = this.is
    
    const a = arguments
    for (let i = a.length; i-- > 0;) {
      if (is in a[i] && typeof a[i] !== 'function') {
        return +a[i][is]
      }
    }
    return +is
    // return +(
    //   alib && is in alib && typeof alib[is] !== 'function' ? alib[is]
    //     : slib && is in slib && typeof slib[is] !== 'function' ? slib[is]
    //       : is
    // )
  }
}

//
// FunctionNode
//
function map_calc(this: MathLib[], v: INode): number {
  return v.calc.apply(void 0, this)
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

  // toString(): string {
  //   return `${this.is}(${this.isArgs.join(', ')})`
  // }

  calc(...funcs: MathLib[]): number
  calc(): number {
    const is = this.is

    const a = arguments
    for (let i = a.length; i-- > 0;) {
      if (is in a[i] && typeof a[i][is] === 'function') {
        return +a[i][is].apply(void 0, this.isArgs.map(map_calc, a))
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
  add, // sub,
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

  // toString(): string {
  //   const isLeft = ((this.isLeft || '') + '').trim()
  //   const isRight = ((this.isRight || '') + '').trim()
  //   const leftSpace = isRight ? ' ' : ''
  //   const rightSpace = isLeft ? ' ' : ''
  //   return isLeft + leftSpace + this.is + rightSpace + isRight
  // }

  calc(...funcs: MathLib[]): number
  // eslint-disable-next-line consistent-return
  calc(): number {
    const is = this.is
    const isLeftBlock = this.isLeft
    const isRightBlock = this.isRight

    const a = arguments
    const isLeft = isLeftBlock ? isLeftBlock.calc(a) : NaN
    const isRight = isRightBlock ? isRightBlock.calc(a) : NaN

    if (!isRightBlock) {
      if (isLeftBlock) {
        if (is === '%') return div(isLeft, 100)
      }
      return isLeft
    }
    
    if (!isLeftBlock) {
      if (isRightBlock) {
        if (is === '-') return -isRight
        if (is === '!') return +!isRight
        if (is === '~') return ~isRight
        // if (is === '+') return isRight
      }
      return isRight
    }

    for (let i = a.length; i-- > 0;) {
      if (is in a[i] && typeof a[i][is] === 'function') {
        return +a[i][is](isLeft, isRight)
      }
    }

    // eslint-disable-next-line default-case
    switch (is) {
      // case '!': return NaN
      // case '~': return NaN
      case '**': return exp(isLeft, isRight)
      case '*': return mul(isLeft, isRight)
      case '/': return div(isLeft, isRight)
      case '%': return rem(isLeft, isRight)
      case '+': return add(isLeft, isRight)
      case '-': return add(isLeft, -isRight)
      case '<<': return isLeft << isRight
      case '>>': return isLeft >> isRight
      case '>>>': return isLeft >>> isRight
      case '<': return isLeft < isRight ? 1 : 0
      case '<=': return isLeft <= isRight ? 1 : 0
      case '>': return isLeft > isRight ? 1 : 0
      case '>=': return isLeft >= isRight ? 1 : 0
      case '=':
      case '==':
      case '===': return isLeft === isRight ? 1 : 0
      // case '!':
      case '!=':
      case '!==': return isLeft !== isRight ? 1 : 0
      case '&': return isLeft & isRight
      case '^': return isLeft ^ isRight
      case '|': return isLeft | isRight
      case '&&': return isLeft ? isRight : isLeft
      case '||': return isLeft ? isLeft : isRight
      case '??': return isLeft === isLeft ? isLeft : isRight
    }
    return NaN
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
const OPERATORS: any = {
  // '('  : 19,
  // ')'  : 19,
  '!'  : 14,
  '~'  : 14,
  '**' : 13,
  '*'  : 12,
  '/'  : 12,
  '%'  : 12,
  '+'  : 11,
  '-'  : 11,
  '<<' : 10,
  '>>' : 10,
  '>>>': 10,
  '<'  : 9,
  '<=' : 9,
  '>'  : 9,
  '>=' : 9,
  '='  : 8,
  '==' : 8,
  '!=' : 8,
  '===': 8,
  '!==': 8,
  '&'  : 7,
  '^'  : 6,
  '|'  : 5,
  '&&' : 4,
  '||' : 3,
  '??' : 3,
  '?'  : 2,
  ':'  : 2,
  ','  : 1,
}

type OperatorsTmp = {
  // deep        // idx  // priority
  [key: string]: number[][]
}

type Operators = {
  // deep        // idx
  [key: string]: number[]
}

type Parenthsis_and_Conditions = {
  // deep          // first   // second
  [key: string]: { f: number, s: number }[]
}

function parse(
  A: string[], deep: number, offset: number,
  parenthsis: Parenthsis_and_Conditions, conditions: Parenthsis_and_Conditions,
  commas: Operators, operators: Operators
): any {
  // ,
  if (commas[deep] && commas[deep].length) {
    for (let a = commas[deep], f: number, i = a.length; i-- > 0;) {
      f = a[i] - offset
      if (f > -1 && f < A.length) {
        a.splice(i, 1)
        return concat(
          parse(A.slice(0, f), deep, offset, parenthsis, conditions, commas, operators),
          parse(A.slice(f + 1), deep, offset + f + 1, parenthsis, conditions, commas, operators),
        )
      }
    }
  }

  if (conditions[deep] && conditions[deep].length) {
    for (let a = conditions[deep], f: number, s: number, i = a.length; i-- > 0;) {
      f = a[i].f - offset, s = a[i].s - offset
      if (f > -1 && f < A.length && s > f) {
        a.splice(i, 1)
        return new ConditionalNode(
          last(concat(
            parse(A.slice(s + 1), deep, offset + s + 1, parenthsis, conditions, commas, operators)
          )),
          last(concat(
            parse(A.slice(f + 1, s), deep, offset + f + 1, parenthsis, conditions, commas, operators)
          )),
          last(concat(
            parse(A.slice(0, f), deep, offset, parenthsis, conditions, commas, operators)
          )),
        )
      }
    }
  }

  if (operators[deep] && operators[deep].length) {
    for (let a = operators[deep], f: number, i = a.length; i-- > 0;) {
      f = a[i] - offset
      if (f > -1 && f < A.length) {
        // TODO: нужно оптимизировать эту херню
        // она нужна для унарных символов и для работы процентов там где нужно
        if (i > 0 && (
          // --4
          OPERATORS[A[f - 1]] && A[f - 1] !== '%' ||
          // 4%
          A[f] === '%' && (!A[f + 1] || OPERATORS[A[f + 1]])
        )) {
          continue
        }
        a.splice(i, 1)
        return new OperatorNode(
          A[f],
          last(concat(
            parse(A.slice(f + 1), deep, offset + f + 1, parenthsis, conditions, commas, operators)
          )),
          last(concat(
            parse(A.slice(0, f), deep, offset, parenthsis, conditions, commas, operators)
          )),
        )
      }
    }
  }

  if (parenthsis[deep] && parenthsis[deep].length) {
    for (let a = parenthsis[deep], f: number, s: number, i = a.length; i-- > 0;) {
      f = a[i].f - offset, s = a[i].s - offset
      if (f > -1 && f < A.length && s > f) {
        a.splice(i, 1)
        return A[f] === '('
          ? new ParenthesisNode(
            last(concat(
              parse(A.slice(f + 1, s), deep + 1, offset + f + 1, parenthsis, conditions, commas, operators)
            ))
          )
          : new FunctionNode(
            A[f],
            concat(
              parse(A.slice(f + 2, s), deep + 1, offset + f + 2, parenthsis, conditions, commas, operators)
            )
          )
      }
    }
  }

  const val = A.join('')
  return val ? new ConstantNode(val) : []
}

function setOperator(
  operators: OperatorsTmp, deep: number, priority: number, a: string[]
): void {
  operators[deep] || (operators[deep] = [])
  operators[deep][priority] || (operators[deep][priority] = [])
  operators[deep][priority][priority === OPERATORS['**'] ? 'unshift' : 'push'](a.length)
}

function setMultiply(
  operators: OperatorsTmp, deep: number, a: string[]
): void {
  setOperator(operators, deep, OPERATORS['*'], a)
  a.push('*')
}

// 
export function createProgram(source: string): ProgramNode {
  source = '(' + source + ')'
  REG.lastIndex = 0
  const A: string[] = []
  let idx = 0
  let v: string, vLast: string = '', vAny: string
  let deep = 0, squares = 0, tmp: any

  const parenthsis: Parenthsis_and_Conditions = {}
  const parenthsisTmp: Parenthsis_and_Conditions = {}
  const conditions: Parenthsis_and_Conditions = {}
  const conditionsTmp: Parenthsis_and_Conditions = {}

  const commas: Operators = {}
  const operators: Operators = {}
  const operatorsTmp: OperatorsTmp = {}

  for (let m: RegExpExecArray; m = REG.exec(source)!;) {
    // console.log(m)

    switch (v = m[0]) {
      case '[': {
        squares++
        break
      }
      case ']': {
        squares--
        break
      }
      default: {
        if (squares !== 0) break

        if (m.index > idx && (vAny = source.slice(idx, m.index).trim())) {
          if (vLast === ')') setMultiply(operatorsTmp, deep, A)
          A.push(vLast = vAny)
        }

        switch (v) {
          case '(': {
            parenthsisTmp[deep] || (parenthsisTmp[deep] = [])
            parenthsisTmp[deep].push({ f: A.length, s: -1 })
            if (vLast) {
              if (/^[a-z][$\w]*$/.test(vLast)) {
                if (tmp = parenthsisTmp[deep] && last(parenthsisTmp[deep])) tmp.f--
              } else if (vLast !== '(' && !OPERATORS[vLast]) {
                setMultiply(operatorsTmp, deep, A)
                if (tmp = parenthsisTmp[deep] && last(parenthsisTmp[deep])) tmp.f++
              }
            }
            deep++
            break
          }
          case ')': {
            --deep
            if (tmp = parenthsisTmp[deep] && last(parenthsisTmp[deep])) {
              tmp.s = A.length
              ;(parenthsis[deep] || (parenthsis[deep] = []))
                .push(parenthsisTmp[deep].pop()!)
            }
            break
          }
          default: {
            if (vLast === ')' && !OPERATORS[v]) {
              setMultiply(operatorsTmp, deep, A)
              vLast = '*'
            }

            switch (v) {
              case ',': {
                commas[deep] || (commas[deep] = [])
                commas[deep].push(A.length)
                break
              }
              case '?': {
                conditionsTmp[deep] || (conditionsTmp[deep] = [])
                conditionsTmp[deep].push({ f: A.length, s: -1 })
                break
              }
              case ':': {
                if (tmp = conditionsTmp[deep] && last(conditionsTmp[deep])) {
                  tmp.s = A.length
                  ;(conditions[deep] || (conditions[deep] = []))
                    .push(conditionsTmp[deep].pop()!)
                }
                break
              }
              default: {
                setOperator(operatorsTmp, deep, OPERATORS[v], A)
              }
            }
          }
        }
    
        A.push(vLast = v)
        idx = m.index + v.length
      }
    }
  }

  for (const d in operatorsTmp) {
    operators[d] = []
    for (let o = operatorsTmp[d], j = o.length; j-- > 0;) {
      if (o[j]) Array.prototype.push.apply(operators[d], o[j])
    }
  }

  return new ProgramNode(
    last(concat(
      parse(A.slice(1, -1), 1, 1, parenthsis, conditions, commas, operators)
    ))
  )
}
