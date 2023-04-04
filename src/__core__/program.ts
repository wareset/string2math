import { concat, last, is_equal_with_zero } from './utils'

// |\[[^\]]*\]
const REG_FOR_OPERATORS =
  /\?\??|\|\|?|\*\*?|&&?|<<|>>>?|[!=]=?=?|[<>]=?|(?<!\d\.?[eE])[-+]|[,:~^%/()[\]]/g

// const REG_FOR_FNS = /^[a-z][$\w]*$/

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
// type MathLibs = MathLib[] | IArguments

type ArrayFlat = string[] // | (string | ArrayFlat)[]

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

  calculate(...funcs: MathLib[]): number
  calculate(): number {
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

  calculate(...funcs: MathLib[]): number
  calculate(): number {
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

  calculate(...funcs: MathLib[]): number
  calculate(): number {
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

  calculate(...funcs: MathLib[]): number
  calculate(): number {
    const is = this.is
    
    const a = arguments
    for (let i = a.length; i-- > 0;) {
      if (is in a[i] && typeof a[i] !== 'function') {
        return +a[i][is]
      }
    }
    return +is
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
    return concat(this.is, '(', concat.apply(void 0, this.isArgs.map(map_toArr, [isSafe])), ')') as any
  }

  toString(): string {
    return `${this.is}(${this.isArgs.join(', ')})`
  }

  calculate(...funcs: MathLib[]): number
  calculate(): number {
    const is = this.is

    const a = arguments
    for (let i = a.length; i-- > 0;) {
      if (is in a[i] && typeof a[i][is] === 'function') {
        return +a[i][is].apply(void 0, this.isArgs.map(map_calculate, a))
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

  calculate(...funcs: MathLib[]): number
  // eslint-disable-next-line consistent-return
  calculate(): number {
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
      if (is === '-') return fn ? +fn(-isRight, 0) : -isRight
      if (is === '!') return fn ? +fn(isRight) : +!isRight
      if (is === '~') return fn ? +fn(isRight) : ~isRight
      return isRight
    }

    if (fn) return +fn(isLeft, isRight)
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
      case '-': return add(isLeft, -isRight)
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
      case '==': return isLeft === isRight ? 1 : 0
      case '===': return is_equal_with_zero(isLeft, isRight) ? 1 : 0
      case '!=': return isLeft !== isRight ? 1 : 0
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
  //- ? :
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
  // /*-+
  if (operators[deep] && operators[deep].length) {
    for (let a = operators[deep], f: number, i = a.length; i-- > 0;) {
      f = a[i] - offset
      if (f > -1 && f < A.length) {
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
  // ()
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
  operators: OperatorsTmp, deep: number, priority: number, A: string[]
): void {
  operators[deep] || (operators[deep] = [])
  operators[deep][priority] || (operators[deep][priority] = [])
  operators[deep][priority][priority === OPERATORS['**'] ? 'unshift' : 'push'](A.length)
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
  REG_FOR_OPERATORS.lastIndex = 0
  const A: string[] = []
  let idx = 0
  let v: string, vLast: string = '', vAny: string
  let deep = 0, squares = 0, tmp: any

  const parenthsis: Parenthsis_and_Conditions = {}
  const parenthsisTmp: Parenthsis_and_Conditions = {}
  const conditions: Parenthsis_and_Conditions = {}
  const conditionsTmp: Parenthsis_and_Conditions = {}

  let d = OPERATORS['!']
  let priority: number

  const commas: Operators = {}
  const operators: Operators = {}
  const operatorsTmp: OperatorsTmp = {}

  for (let m: RegExpExecArray; m = REG_FOR_OPERATORS.exec(source)!;) {
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
            if (vLast && vLast !== '(' && !(OPERATORS[vLast] > 0)) {
              if (
                !source[m.index - 1].trim() ||
                vLast === 'NaN' || '' + +vLast !== 'NaN'
              ) {
                setMultiply(operatorsTmp, deep, A)
                if (tmp = parenthsisTmp[deep] && last(parenthsisTmp[deep])) tmp.f++
              } else {
                // eslint-disable-next-line no-lonely-if
                if (tmp = parenthsisTmp[deep] && last(parenthsisTmp[deep])) tmp.f--
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
            if (vLast === ')' && !(OPERATORS[v] > 0)) {
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
                if (vLast === '(' || OPERATORS[vLast] > 0) {
                  if (v === '-' || v === '!' || v === '~') priority = ++d
                  else { idx = m.index + v.length; continue }
                } else priority = OPERATORS[v]
                setOperator(operatorsTmp, deep, priority, A)
              }
            }
          }
        }
    
        idx = m.index + v.length
        A.push(vLast = OPERATORS[v] === 8 ? v[0] + '=' + (v[2] || '') : v)
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
