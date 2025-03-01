# stringmath

A library for calculating mathematical expressions from a string

## How it works

```sh
npm install stringmath
```

### Calculate

```js
import stringmath from 'stringmath'
```

#### Base

```js
let program_1 = stringmath('1 + 2 * 3 === 7 ? 1 : 0')
console.log(program_1.calculate()) // 1
```

#### Variables

```js
let program_2 = stringmath('var_1 + var_2 * 3')
console.log(program_2.calculate({ var_1: 1, var_2: 2 })) // 7

// complex variable names should be written in square brackets

program_2 = stringmath('[EUR/USD] / [GBP/USD]')
console.log(program_2.calculate({ '[EUR/USD]': 1.04, '[GBP/USD]': 1.26 }))
```

#### Functions

```js
let program_3 = stringmath('func(1, 2) + x')
console.log(program_3.calculate({ func: Math.max, x: 5 })) // 7

// or

program_3 = stringmath('max(1, 2) + x')
console.log(program_3.calculate(Math, { x: 5 })) // 7
```

#### Custom operators

```js
let program_4 = stringmath('vec2(1, 2) + vec2(3, 4)')
console.log(
  program_4.calculate({
    vec2: (x, y) => ({ x: x, y: y }),
    '+': (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
  })
) // { x: 4, y: 6 }
```

All operators can be replaced:

```
 '!'  : 'Logical NOT',
 '~'  : 'Bitwise NOT',
 '**' : 'Exponentiation',
 '*'  : 'Multiplication',
 '/'  : 'Division',
 '%'  : 'Remainder',
 '+'  : 'Addition',
 '-'  : 'Subtraction',
 '<<' : 'Bitwise left shift',
 '>>' : 'Bitwise right shift',
 '>>>': 'Bitwise unsigned right shift',
 '<'  : 'Less than',
 '<=' : 'Less than or equal',
 '>'  : 'Greater than',
 '>=' : 'Greater than or equal',
 '==' : 'Equality',
 '!=' : 'Inequality',
 '='  : 'Strict equality',
 '===': 'Strict equality',
 '!==': 'Strict inequality',
 '&'  : 'Bitwise AND',
 '^'  : 'Bitwise XOR',
 '|'  : 'Bitwise OR',
 '&&' : 'Logical AND',
 '||' : 'Logical OR',
 '??' : 'Coalescing NaN'
```

By default, '=' is equivalent to '===', but they can be replaced independently.

### Schema and Nodes

```js
// Nodes
import {
  ProgramNode,
  ConditionNode,
  VariableNode,
  ConstantNode,
  FunctionNode,
  OperatorNode,
} from 'stringmath'

import stringmath from 'stringmath'

const program = stringmath('(x + 1) * 2 - 3 >= func(4, 5) ? 6 : 7')

console.log(program)
//  ||
//  ||
// \  /
//  \/
_ = /* ProgramNode */ {
  type: 'Program',
  nodeChild: /* ConditionNode */ {
    type: 'Condition',
    nodeIf: /* OperatorNode */ {
      type: 'Operator',
      operator: '>=',
      nodeLeft: /* OperatorNode */ {
        type: 'Operator',
        operator: '-',
        nodeLeft: /* OperatorNode */ {
          type: 'Operator',
          operator: '*',
          nodeLeft: /* OperatorNode */ {
            type: 'Operator',
            operator: '+',
            nodeLeft: /* VariableNode */ {
              type: 'Variable',
              variable: 'x',
            },
            nodeRight: /* ConstantNode */ {
              type: 'Constant',
              constant: 1,
            },
          },
          nodeRight: /* ConstantNode */ {
            type: 'Constant',
            constant: 2,
          },
        },
        nodeRight: /* ConstantNode */ {
          type: 'Constant',
          constant: 3,
        },
      },
      nodeRight: /* FunctionNode */ {
        type: 'Function',
        function: 'func',
        nodeListOfArgs: [
          /* ConstantNode */ {
            type: 'Constant',
            constant: 4,
          },
          /* ConstantNode */ {
            type: 'Constant',
            constant: 5,
          },
        ],
      },
    },
    nodeThen: /* ConstantNode */ {
      type: 'Constant',
      constant: 6,
    },
    nodeElse: /* ConstantNode */ {
      type: 'Constant',
      constant: 7,
    },
  },
}
```

## License

[MIT](LICENSE)
