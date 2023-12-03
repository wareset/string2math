type INode = OperatorNode | ParenthesisNode | FunctionNode | ConstantNode | ConditionalNode;
type MathLib = {
    [key: string]: any;
};
type ToArray = string[];
export declare class ProgramNode {
    type: 'Program';
    is: INode | undefined;
    constructor(data: INode | undefined);
    toArray(): ToArray;
    toString(): string;
    calculate(...funcs: MathLib[]): any;
}
export declare class ParenthesisNode {
    type: 'Parenthesis';
    is: INode | undefined;
    constructor(data: INode | undefined);
    toArray(): ToArray;
    toString(): string;
    calculate(...funcs: MathLib[]): any;
}
export declare class ConditionalNode {
    type: 'Conditional';
    is: INode | undefined;
    isTrue: INode | undefined;
    isFalse: INode | undefined;
    constructor(falseExp: INode | undefined, trueExp: INode | undefined, condition: INode | undefined);
    toArray(): ToArray;
    toString(): string;
    calculate(...funcs: MathLib[]): any;
}
export declare class ConstantNode {
    type: 'Constant';
    is: string;
    constructor(a: string);
    toArray(): ToArray;
    toString(): string;
    calculate(...funcs: MathLib[]): any;
}
export declare class FunctionNode {
    type: 'Function';
    is: string;
    isArgs: INode[];
    constructor(a: string, args: INode[]);
    toArray(): ToArray;
    toString(): string;
    calculate(...funcs: MathLib[]): any;
}
export declare class OperatorNode {
    type: 'Operator';
    is: string;
    isLeft: INode | undefined;
    isRight: INode | undefined;
    constructor(operator: string, right: INode | undefined, left: INode | undefined);
    toArray(): ToArray;
    toString(): string;
    calculate(...funcs: MathLib[]): any;
}
export {};
