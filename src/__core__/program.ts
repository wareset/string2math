import { concat, last } from './utils'
import {
  ProgramNode,
  GroupingNode,
  ConditionNode,
  ArgumentNode,
  FunctionNode,
  OperationNode,
} from './classes'

// |\[[^\]]*\]
const REG_FOR_OPERATORS =
  /\?\??|\|\|?|\*\*?|&&?|<<|>>>?|[!=]=?=?|[<>]=?|(?<!\d\.?[eE])[-+]|[,:~^%/()[\]]/g

// const REG_FOR_FNS = /^[a-z][$\w]*$/

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
// prettier-ignore
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

type Grouping_and_Ternaries = {
  // deep          // first   // second
  [key: string]: { f: number; s: number }[]
}

// prettier-ignore
function parse(
  A: string[], deep: number, offset: number,
  grouping: Grouping_and_Ternaries, ternaries: Grouping_and_Ternaries,
  commas: Operators, operators: Operators
): any {
  // ,
  if (commas[deep] && commas[deep].length) {
    for (let a = commas[deep], f: number, i = a.length; i-- > 0;) {
      f = a[i] - offset
      if (f > -1 && f < A.length) {
        a.splice(i, 1)
        return concat(
          parse(A.slice(0, f), deep, offset, grouping, ternaries, commas, operators),
          parse(A.slice(f + 1), deep, offset + f + 1, grouping, ternaries, commas, operators),
        )
      }
    }
  }
  //- ? :
  if (ternaries[deep] && ternaries[deep].length) {
    for (let a = ternaries[deep], f: number, s: number, i = a.length; i-- > 0;) {
      f = a[i].f - offset, s = a[i].s - offset
      if (f > -1 && f < A.length && s > f) {
        a.splice(i, 1)
        return new ConditionNode(
          last(concat(
            parse(A.slice(s + 1), deep, offset + s + 1, grouping, ternaries, commas, operators)
          )),
          last(concat(
            parse(A.slice(f + 1, s), deep, offset + f + 1, grouping, ternaries, commas, operators)
          )),
          last(concat(
            parse(A.slice(0, f), deep, offset, grouping, ternaries, commas, operators)
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
        return new OperationNode(
          A[f],
          last(concat(
            parse(A.slice(f + 1), deep, offset + f + 1, grouping, ternaries, commas, operators)
          )),
          last(concat(
            parse(A.slice(0, f), deep, offset, grouping, ternaries, commas, operators)
          )),
        )
      }
    }
  }
  // ()
  if (grouping[deep] && grouping[deep].length) {
    for (let a = grouping[deep], f: number, s: number, i = a.length; i-- > 0;) {
      f = a[i].f - offset, s = a[i].s - offset
      if (f > -1 && f < A.length && s > f) {
        a.splice(i, 1)
        return A[f] === '('
          ? new GroupingNode(
            last(concat(
              parse(A.slice(f + 1, s), deep + 1, offset + f + 1, grouping, ternaries, commas, operators)
            ))
          )
          : new FunctionNode(
            A[f],
            concat(
              parse(A.slice(f + 2, s), deep + 1, offset + f + 2, grouping, ternaries, commas, operators)
            )
          )
      }
    }
  }

  const val = A.join('')
  return val ? new ArgumentNode(val) : []
}

// prettier-ignore
function setOperator(
  operators: OperatorsTmp, deep: number, priority: number, A: string[]
): void {
  operators[deep] || (operators[deep] = [])
  operators[deep][priority] || (operators[deep][priority] = [])
  operators[deep][priority][priority === OPERATORS['**'] ? 'unshift' : 'push'](A.length)
}

// prettier-ignore
function setMultiply(
  operators: OperatorsTmp, deep: number, a: string[]
): void {
  setOperator(operators, deep, OPERATORS['*'], a)
  a.push('*')
}

// prettier-ignore
export function create(source: string): ProgramNode {
  source = '(' + source + ')'
  const A: string[] = []
  let idx = 0
  let v: string, vLast: string = '', vAny: string
  let deep = 0, squares = 0, tmp: any

  const grouping: Grouping_and_Ternaries = {}
  const groupingTmp: Grouping_and_Ternaries = {}
  const ternaries: Grouping_and_Ternaries = {}
  const ternariesTmp: Grouping_and_Ternaries = {}

  let d = OPERATORS['!']
  let priority: number

  const commas: Operators = {}
  const operators: Operators = {}
  const operatorsTmp: OperatorsTmp = {}

  REG_FOR_OPERATORS.lastIndex = 0
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
            groupingTmp[deep] || (groupingTmp[deep] = [])
            groupingTmp[deep].push({ f: A.length, s: -1 })
            if (vLast && vLast !== '(' && !(OPERATORS[vLast] > 0)) {
              if (
                !source[m.index - 1].trim() ||
                vLast === 'NaN' || '' + +vLast !== 'NaN'
              ) {
                setMultiply(operatorsTmp, deep, A)
                if (tmp = groupingTmp[deep] && last(groupingTmp[deep])) tmp.f++
              } else {
                // eslint-disable-next-line no-lonely-if
                if (tmp = groupingTmp[deep] && last(groupingTmp[deep])) tmp.f--
              }
            }
            deep++
            break
          }
          case ')': {
            --deep
            if (tmp = groupingTmp[deep] && last(groupingTmp[deep])) {
              tmp.s = A.length
              ;(grouping[deep] || (grouping[deep] = []))
                .push(groupingTmp[deep].pop()!)
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
                ternariesTmp[deep] || (ternariesTmp[deep] = [])
                ternariesTmp[deep].push({ f: A.length, s: -1 })
                break
              }
              case ':': {
                if (tmp = ternariesTmp[deep] && last(ternariesTmp[deep])) {
                  tmp.s = A.length
                  ;(ternaries[deep] || (ternaries[deep] = []))
                    .push(ternariesTmp[deep].pop()!)
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
      }
    }
  }

  const push = Array.prototype.push
  for (const d in operatorsTmp) {
    operators[d] = []
    for (let o = operatorsTmp[d], j = o.length; j-- > 0;) {
      if (o[j]) push.apply(operators[d], o[j])
    }
  }

  return new ProgramNode(
    last(concat(
      parse(A.slice(1, -1), 1, 1, grouping, ternaries, commas, operators)
    ))
  )
}
