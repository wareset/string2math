type INode =
  | OperatorNode
  | FunctionNode
  | VariableNode
  | ConstantNode
  | ConditionNode
  | undefined

type MathLib = { [key: string]: any }
// type MathLibs = MathLib[] | IArguments

interface Node {
  type: string
  toArray(): ToArray
  toString(): string
  calculate(...mathLibs: MathLib[]): any
}

type ToArray = (string | number)[] // | (string | ToArray)[]

function toArr(node: INode): any {
  return node ? node.toArray() : [NaN]
}

function calc(node: INode, mathLibs: MathLib[]) {
  return node ? node.calculate.apply(node, mathLibs) : NaN
}

function isFunction(v: any): v is Function {
  return typeof v === 'function'
}

const objectHasOwn: typeof Object.hasOwn =
  Object.hasOwn ||
  function (o, k) {
    return Object.prototype.hasOwnProperty.call(o, k)
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
  readonly type: 'Program'
  nodeChild: INode
  constructor(nodeChild: INode) {
    this.type = 'Program'
    this.nodeChild = nodeChild
  }

  toArray(): ToArray {
    return toArr(this.nodeChild)
  }

  toString(): string {
    return '' + (this.nodeChild || NaN)
  }

  calculate(...mathLibs: MathLib[]): any {
    return calc(this.nodeChild, mathLibs)
  }
}

//
// ConditionNode
//
export class ConditionNode implements Node {
  readonly type: 'Condition'
  nodeIf: INode
  nodeThen: INode
  nodeElse: INode
  constructor(nodeIf: INode, nodeThen: INode, nodeElse: INode) {
    this.type = 'Condition'
    this.nodeIf = nodeIf
    this.nodeThen = nodeThen
    this.nodeElse = nodeElse
  }

  toArray(): ToArray {
    return ['('].concat(
      toArr(this.nodeIf),
      '?',
      toArr(this.nodeThen),
      ':',
      toArr(this.nodeElse),
      ')'
    )
  }

  toString(): string {
    return `(${this.nodeIf || NaN} ? ${this.nodeThen || NaN} : ${this.nodeElse || NaN})`
  }

  calculate(...mathLibs: MathLib[]): any {
    return calc(this.nodeIf, mathLibs)
      ? calc(this.nodeThen, mathLibs)
      : calc(this.nodeElse, mathLibs)
  }
}

//
// VariableNode
//
export class VariableNode implements Node {
  readonly type: 'Variable'
  variable: string
  constructor(variable: string) {
    this.type = 'Variable'
    this.variable = variable
  }

  toArray(): ToArray {
    return [this.variable]
  }

  toString(): string {
    return '' + this.variable
  }

  calculate(...mathLibs: MathLib[]): any {
    for (let i = mathLibs.length, is = this.variable, v; i-- > 0; ) {
      if (objectHasOwn((v = mathLibs[i]), is)) return v[is]
    }
    return NaN
  }
}

//
// ConstantNode
//
export class ConstantNode implements Node {
  readonly type: 'Constant'
  constant: number
  constructor(constant: number) {
    this.type = 'Constant'
    this.constant = constant
  }

  toArray(): ToArray {
    return [this.constant]
  }

  toString(): string {
    return '' + this.constant
  }

  calculate(): any {
    return this.constant
  }
}

//
// FunctionNode
//
export class FunctionNode implements Node {
  readonly type: 'Function'
  function: string
  nodeListOfArgs: INode[]
  constructor(fname: string, nodes: INode[]) {
    this.type = 'Function'
    this.function = fname
    this.nodeListOfArgs = nodes
  }

  toArray(): ToArray {
    return [this.function + '('].concat(
      Array.prototype.concat.apply(
        [],
        this.nodeListOfArgs.map(function (v: INode, k: number) {
          return k === 0 ? toArr(v) : [','].concat(toArr(v))
        })
      ),
      ')'
    )
  }

  toString(): string {
    return `${this.function}(${this.nodeListOfArgs.join(', ')})`
  }

  calculate(...mathLibs: MathLib[]): any {
    const is = this.function
    for (let i = mathLibs.length, v; i-- > 0; )
      if (objectHasOwn((v = mathLibs[i]), is) && isFunction((v = v[is])))
        return v.apply(
          void 0,
          this.nodeListOfArgs.map(function (this: MathLib[], v: INode): number {
            return v ? v.calculate.apply(v, this) : NaN
          }, mathLibs)
        )
    return NaN
  }
}

//
// OperationNode
//
// import { mul, div, rem, add, sub, pow } from './algebra'
export class OperatorNode implements Node {
  readonly type: 'Operator'
  operator: string
  nodeLeft: INode
  nodeRight: INode
  constructor(operator: string, nodeLeft: INode, nodeRight: INode) {
    this.type = 'Operator'
    this.operator = operator
    this.nodeLeft = nodeLeft
    this.nodeRight = nodeRight
  }

  toArray(): ToArray {
    const is = this.operator
    const nL = this.nodeLeft
    const nR = this.nodeRight

    // const vL = toArr(isL)
    // const vR = toArr(isR)

    // prettier-ignore
    return !nR ? toArr(nL) : !nL
      ? is === '!' || is === '~' || is === '-' || is === '+'
        ? [is].concat(toArr(nR)) : toArr(nR)
      : is === '!' || is === '~'
        ? [NaN] : ['('].concat(toArr(nL), is, toArr(nR), ')')
  }

  toString(): string {
    const is = this.operator
    const nL = this.nodeLeft
    const nR = this.nodeRight

    const vL = '' + (nL || NaN)
    const vR = '' + (nR || NaN)

    // prettier-ignore
    return !nR ? vL : !nL
      ? is === '!' || is === '~' || is === '-' || is === '+' ? is + vR : vR
      : is === '!' || is === '~' ? 'NaN' : `(${vL} ${is} ${vR})`
  }

  calculate(...mathLibs: MathLib[]): any {
    const is = this.operator
    const nL = this.nodeLeft
    const nR = this.nodeRight

    let vL = calc(nL, mathLibs)
    if (!nR) return vL
    let vR = calc(nR, mathLibs)

    let fn!: Function
    for (let i = mathLibs.length, v; i-- > 0; )
      if (objectHasOwn((v = mathLibs[i]), is) && isFunction((v = v[is]))) {
        fn = v
        break
      }

    if (!nL) {
      switch (is) {
        // 14
        case '!':
          return fn ? fn(vR) : +!+vR
        case '~':
          return fn ? fn(vR) : ~+vR
        // 11
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
      case '==':
        return vL == vR ? 1 : 0
      case '=':
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
