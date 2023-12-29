import { concat, arrayConcat, isFunction, objectHasOwn } from './utils'

type INode = OperationNode | GroupingNode | FunctionNode | ArgumentNode | ConditionNode

type MathLib = { [key: string]: any }
// type MathLibs = MathLib[] | IArguments

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
export class ProgramNode {
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
export class GroupingNode {
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
export class ConditionNode {
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
    return concat('(', toArr(this.data), '?', toArr(this.dataTrue), ':', toArr(this.dataFalse), ')')
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
export class ArgumentNode {
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
export class FunctionNode {
  type: 'Function'
  data: string
  dataArgs: INode[]
  constructor(a: string, args: INode[]) {
    this.type = 'Function'
    this.data = a as any
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
export class OperationNode {
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
    const isLeft = this.dataLeft
    const isRight = this.dataRight

    const vLeft = toArr(isLeft)
    const vRight = toArr(isRight)

    // prettier-ignore
    return !isRight ? vLeft : !isLeft
      ? is === '!' || is === '~' || is === '-' ? concat(is, vRight) : vRight
      : is === '!' || is === '~' ? ['NaN'] : concat('(', vLeft, is, vRight, ')')
  }

  toString(): string {
    const is = this.data
    const isLeft = this.dataLeft
    const isRight = this.dataRight

    const vLeft = '' + (isLeft || NaN)
    const vRight = '' + (isRight || NaN)

    // prettier-ignore
    return !isRight ? vLeft : !isLeft
      ? is === '!' || is === '~' || is === '-' ? is + vRight : vRight
      : is === '!' || is === '~' ? 'NaN' : `(${vLeft} ${is} ${vRight})`
  }

  calculate(mathLibs?: MathLib[]): any {
    const is = this.data
    const isLeft = this.dataLeft
    const isRight = this.dataRight

    let vLeft = calc(isLeft, mathLibs)
    let vRight = calc(isRight, mathLibs)

    if (!isRight) return vLeft

    let fn!: Function
    if (mathLibs)
      for (let i = mathLibs.length, v; i-- > 0; ) {
        if (objectHasOwn((v = mathLibs[i]), is) && isFunction((v = v[is]))) {
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
          return fn ? fn(0, vRight) : +vRight
        case '-':
          return fn ? fn(0, vRight) : -+vRight
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
        return Math.pow(vLeft, vRight) // pow(vLeft, vRight)
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
