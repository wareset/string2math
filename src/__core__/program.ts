import { concat, last } from './utils'
import {
  ProgramNode, 
  ParenthesisNode,
  ConditionalNode,
  ConstantNode,
  FunctionNode,
  OperatorNode
} from './classes'

// |\[[^\]]*\]
const REG_FOR_OPERATORS =
  /\?\??|\|\|?|\*\*?|&&?|<<|>>>?|[!=]=?=?|[<>]=?|(?<!\d\.?[eE])[-+]|[,:~^%/()[\]]/g

// const REG_FOR_FNS = /^[a-z][$\w]*$/

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
        A.push(vLast = v)
        // A.push(vLast = OPERATORS[v] === 8 ? v[0] + '=' + (v[2] || '') : v)
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
