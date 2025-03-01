# string2math

A library for calculating mathematical expressions from a string

## How it works

```sh
npm install string2math
```

### Calculate

```js
import string2math from 'string2math'
```

#### Numbers

```js
let program_1 = string2math('(1.2 + 42) * -4.4e-2')
console.log(program_1.calculate())
```

#### Variables

```js
let program_2 = string2math('var_1 + var_2 * 3')
console.log(program_2.calculate({ var_1: 1, var_2: 2 })) // 7

// complex variable names should be written in square brackets

program_2 = string2math('[EUR / USD] / [GBP / USD]')
console.log(program_2.calculate({ '[EUR / USD]': 1.04, '[GBP / USD]': 1.26 }))
```

#### Functions

```js
let program_3 = string2math('func(1, 2) + x')
console.log(program_3.calculate({ func: Math.max, x: 5 })) // 7

// or

program_3 = string2math('max(1, 2) + x')
console.log(program_3.calculate(Math, { x: 5 })) // 7
```

#### Conditions

```js
let program_1 = string2math('x !== -Infinity ? x : NaN')
console.log(program_1.calculate({ x: 42 })) // 42
```

#### Custom operators

```js
let program_4 = string2math('vec2(1, 2) + vec2(3, 4) - -vec2(1, 1)')
console.log(
  program_4.calculate({
    vec2: (x, y) => ({ x: x, y: y }),
    '+': (v1 = { x: 0, y: 0 }, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
    '-': (v1 = { x: 0, y: 0 }, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
  })
) // { x: 5, y: 7 }

/*
NOTE
The operators "+" and "-" can be placed before a variable, like "!" and "~":
-~2 - -3 * +!5

In this case, the function will be called like this:

addition(undefined, value) // +
subtraction(undefined, value) // -

!!! We need to keep this in mind !!!
*/
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
} from 'string2math'

import string2math from 'string2math'

const program = string2math('(x + 1) * 2 - 3 >= func(4, 5) ? 6 : 7')

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
