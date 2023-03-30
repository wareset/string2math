declare type INode = COperator | CParenthesis | CFunction | CConstant | CConditional;
declare type MathLib = {
    [key: string]: any;
};
export declare class CProgram {
    type: 'Program';
    is: INode | undefined;
    constructor(data: INode | undefined);
    calc(...funcs: MathLib[]): number;
}
export declare class CParenthesis {
    type: 'Parenthesis';
    is: INode | undefined;
    constructor(data: INode | undefined);
    calc(...funcs: MathLib[]): number;
}
export declare class CConditional {
    type: 'Conditional';
    is: INode | undefined;
    isTrue: INode | undefined;
    isFalse: INode | undefined;
    constructor(falseExp: INode | undefined, trueExp: INode | undefined, condition: INode | undefined);
    calc(...funcs: MathLib[]): number;
}
export declare class CConstant {
    type: 'Constant';
    is: string;
    constructor(a: string);
    calc(...funcs: MathLib[]): number;
}
export declare class CFunction {
    type: 'Function';
    is: string;
    isArgs: INode[];
    constructor(a: string, args: INode[]);
    calc(...funcs: MathLib[]): number;
}
export declare class COperator {
    type: 'Operator';
    is: string;
    isLeft: INode | undefined;
    isRight: INode | undefined;
    constructor(operator: string, right: INode | undefined, left: INode | undefined);
    calc(...funcs: MathLib[]): number;
}
export declare function createProgram(source: string): CProgram;
export {};
