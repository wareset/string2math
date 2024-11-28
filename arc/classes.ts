import { concat, arrayConcat, isFunction, objectHasOwn } from './utils'

type INode = OperationNode | GroupingNode | FunctionNode | ArgumentNode | ConditionNode

type MathLib = { [key: string]: any }
// type MathLibs = MathLib[] | IArguments

export interface Node {
  type: string
  toArray(): ToArray
  toString(): string
  calculate(mathLibs?: MathLib[]): any
}

type ToArray = string[] // | (string | ToArray)[]

function toArr(node: INode | undefined) {
  return node ? node.toArray() : ['NaN']
}

function calc(node: INode | undefined, mathLibs?: MathLib[]) {
  return node ? node.calculate(mathLibs) : NaN
}

// Program
// Argument
// Function
// Grouping
// Condition
// Operation

//
// ProgramNode
//
export class ProgramNode implements Node {
  type: 'Program'
  data: INode | undefined
  constructor(data: INode | undefined) {
    this.type = 'Program'
    this.data = data
  }

  toArray(): ToArray {
    return toArr(this.data)
  }

  toString(): string {
    return '' + (this.data || NaN)
  }

  calculate(mathLibs?: MathLib[]): any {
    return calc(this.data, mathLibs)
  }
}

//
// GroupingNode
//
export class GroupingNode implements Node {
  type: 'Grouping'
  data: INode | undefined
  constructor(data: INode | undefined) {
    this.type = 'Grouping'
    this.data = data
  }

  toArray(): ToArray {
    return toArr(this.data)
  }

  toString(): string {
    return '' + (this.data || NaN)
  }

  calculate(mathLibs?: MathLib[]): any {
    return calc(this.data, mathLibs)
  }
}

//
// ConditionNode
//
export class ConditionNode implements Node {
  type: 'Condition'
  data: INode | undefined
  dataTrue: INode | undefined
  dataFalse: INode | undefined
  constructor(
    falseExp: INode | undefined,
    trueExp: INode | undefined,
    condition: INode | undefined
  ) {
    this.type = 'Condition'
    this.data = condition
    this.dataTrue = trueExp
    this.dataFalse = falseExp
  }

  toArray(): ToArray {
    return concat(
      '(',
      toArr(this.data),
      '?',
      toArr(this.dataTrue),
      ':',
      toArr(this.dataFalse),
      ')'
    )
  }

  toString(): string {
    return `(${this.data || NaN} ? ${this.dataTrue || NaN} : ${this.dataFalse || NaN})`
  }

  calculate(mathLibs?: MathLib[]): any {
    return calc(this.data, mathLibs)
      ? calc(this.dataTrue, mathLibs)
      : calc(this.dataFalse, mathLibs)
  }
}

//
// ArgumentNode
//
export class ArgumentNode implements Node {
  type: 'Argument'
  data: string
  constructor(a: string) {
    this.type = 'Argument'
    this.data = a
  }

  toArray(): ToArray {
    return [this.data]
  }

  toString(): string {
    return '' + this.data
  }

  calculate(mathLibs?: MathLib[]): any {
    const is = this.data
    const v = +is
    if (v !== v && is !== 'NaN' && mathLibs)
      for (let i = mathLibs.length, v; i-- > 0; ) {
        if (objectHasOwn((v = mathLibs[i]), is)) return v[is]
      }
    return v
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
export class FunctionNode implements Node {
  type: 'Function'
  data: string
  dataArgs: INode[]
  constructor(a: string, args: INode[]) {
    this.type = 'Function'
    this.data = a
    this.dataArgs = args
  }

  toArray(): ToArray {
    return concat(this.data + '(', arrayConcat.apply([], this.dataArgs.map(map_toArr)), ')')
  }

  toString(): string {
    return `${this.data}(${this.dataArgs.join(', ')})`
  }

  calculate(mathLibs?: MathLib[]): any {
    const is = this.data
    if (mathLibs)
      for (let i = mathLibs.length, v; i-- > 0; ) {
        if (objectHasOwn((v = mathLibs[i]), is) && isFunction((v = v[is]))) {
          return v.apply(void 0, this.dataArgs.map(map_calculate, mathLibs))
        }
      }
    return NaN
  }
}

//
// OperationNode
//
// import { mul, div, rem, add, sub, pow } from './algebra'
export class OperationNode implements Node {
  type: 'Operation'
  data: string
  dataLeft: INode | undefined
  dataRight: INode | undefined
  constructor(operator: string, right: INode | undefined, left: INode | undefined) {
    this.type = 'Operation'
    this.data = operator
    this.dataLeft = left
    this.dataRight = right
  }

  toArray(): ToArray {
    const is = this.data
    const isL = this.dataLeft
    const isR = this.dataRight

    // const vL = toArr(isL)
    // const vR = toArr(isR)

    // prettier-ignore
    return !isR ? toArr(isL) : !isL
      ? is === '!' || is === '~' || is === '-' ? concat(is, toArr(isR)) : toArr(isR)
      : is === '!' || is === '~' ? ['NaN'] : concat('(', toArr(isL), is, toArr(isR), ')')
  }

  toString(): string {
    const is = this.data
    const isL = this.dataLeft
    const isR = this.dataRight

    const vL = '' + (isL || NaN)
    const vR = '' + (isR || NaN)

    // prettier-ignore
    return !isR ? vL : !isL
      ? is === '!' || is === '~' || is === '-' ? is + vR : vR
      : is === '!' || is === '~' ? 'NaN' : `(${vL} ${is} ${vR})`
  }

  calculate(mathLibs?: MathLib[]): any {
    const is = this.data
    const isL = this.dataLeft
    const isR = this.dataRight

    let vL = calc(isL, mathLibs)
    if (!isR) return vL
    let vR = calc(isR, mathLibs)

    let fn!: Function
    if (mathLibs)
      for (let i = mathLibs.length, v; i-- > 0; )
        if (objectHasOwn((v = mathLibs[i]), is) && isFunction((v = v[is]))) {
          fn = v
          break
        }

    if (!isL) {
      switch (is) {
        // 14
        case '!':
          return fn ? fn(vR) : +!+vR
        case '~':
          return fn ? fn(vR) : ~+vR
        case '+':
          return fn ? fn(0, vR) : +vR
        case '-':
          return fn ? fn(0, vR) : -+vR
      }
      return vR
    }

    if (fn) return fn(vL, vR)

    vL = +vL
    vR = +vR
    switch (is) {
      // 14
      // case '!': return NaN
      // case '~': return NaN
      // 13
      case '**':
        return Math.pow(vL, vR) // pow(vL, vR)
      // 12
      case '*':
        return vL * vR // mul(vL, vR)
      case '/':
        return vL / vR // div(vL, vR)
      case '%':
        return vL % vR // rem(vL, vR)
      // 11
      case '+':
        return vL + vR // add(vL, vR)
      case '-':
        return vL - vR // sub(vL, vR)
      // 10
      case '<<':
        return vL << vR
      case '>>':
        return vL >> vR
      case '>>>':
        return vL >>> vR
      // 9
      case '<':
        return vL < vR ? 1 : 0
      case '<=':
        return vL <= vR ? 1 : 0
      case '>':
        return vL > vR ? 1 : 0
      case '>=':
        return vL >= vR ? 1 : 0
      // 8
      case '=':
      case '==':
        return vL == vR ? 1 : 0
      case '===':
        return vL === vR ? 1 : 0
      case '!=':
        return vL != vR ? 1 : 0
      case '!==':
        return vL !== vR ? 1 : 0
      // 7
      case '&':
        return vL & vR
      // 6
      case '^':
        return vL ^ vR
      // 5
      case '|':
        return vL | vR
      // 4
      case '&&':
        return vL ? vR : vL
      // 3
      case '||':
        return vL ? vL : vR
      case '??':
        return vL === vL ? vL : vR
    }
    return NaN
  }
}
