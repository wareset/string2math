import { createProgram } from './__core__/program'
export default createProgram

export { createProgram as create }

export type { Raw } from './__core__/algebra'
export { num2raw, raw2num } from './__core__/algebra'
export { add, sub, mul, div, rem, exp } from './__core__/algebra'

export {
  ProgramNode,
  ParenthesisNode,
  ConditionalNode,
  ConstantNode,
  FunctionNode,
  OperatorNode
} from './__core__/program'

// export const OPERATORS = {
//   '('  : 'Opening parenthesis',
//   ')'  : 'Closing parenthesis',
//   '!'  : 'Logical NOT',
//   '~'  : 'Bitwise NOT',
//   '**' : 'Exponentiation',
//   '*'  : 'Multiplication',
//   '/'  : 'Division',
//   '%'  : 'Remainder',
//   '+'  : 'Addition',
//   '-'  : 'Subtraction',
//   '<<' : 'Bitwise left shift',
//   '>>' : 'Bitwise right shift',
//   '>>>': 'Bitwise unsigned right shift',
//   '<'  : 'Less than',
//   '<=' : 'Less than or equal',
//   '>'  : 'Greater than',
//   '>=' : 'Greater than or equal',
//   '='  : 'Equality',
//   '==' : 'Equality',
//   '!=' : 'Inequality',
//   '===': 'Strict equality',
//   '!==': 'Strict inequality',
//   '&'  : 'Bitwise AND',
//   '^'  : 'Bitwise XOR',
//   '|'  : 'Bitwise OR',
//   '&&' : 'Logical AND',
//   '||' : 'Logical OR',
//   '??' : 'Coalescing NaN',
//   '?'  : 'Conditional TRUE',
//   ':'  : 'Conditional FALSE',
//   ','  : 'Comma',
// } as const
