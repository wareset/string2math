export { program as default } from './__core__/program'

// export type { NumRaw } from './__core__/algebra'
// export { num2raw, raw2num } from './__core__/algebra'
// export { add, sub, mul, div, rem, pow } from './__core__/algebra'

export {
  ProgramNode,
  ConditionNode,
  VariableNode,
  ConstantNode,
  FunctionNode,
  OperatorNode
} from './__core__/classes'

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
//   '?'  : 'Condition TRUE',
//   ':'  : 'Condition FALSE',
//   ','  : 'Comma',
// } as const
