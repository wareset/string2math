type INode = OperationNode | GroupingNode | FunctionNode | ArgumentNode | ConditionNode;
type MathLib = {
    [key: string]: any;
};
type ToArray = string[];
export declare class ProgramNode {
    type: 'Program';
    data: INode | undefined;
    constructor(data: INode | undefined);
    toArray(): ToArray;
    toString(): string;
    calculate(mathLibs?: MathLib[]): any;
}
export declare class GroupingNode {
    type: 'Grouping';
    data: INode | undefined;
    constructor(data: INode | undefined);
    toArray(): ToArray;
    toString(): string;
    calculate(mathLibs?: MathLib[]): any;
}
export declare class ConditionNode {
    type: 'Condition';
    data: INode | undefined;
    dataTrue: INode | undefined;
    dataFalse: INode | undefined;
    constructor(falseExp: INode | undefined, trueExp: INode | undefined, condition: INode | undefined);
    toArray(): ToArray;
    toString(): string;
    calculate(mathLibs?: MathLib[]): any;
}
export declare class ArgumentNode {
    type: 'Argument';
    data: string;
    constructor(a: string);
    toArray(): ToArray;
    toString(): string;
    calculate(mathLibs?: MathLib[]): any;
}
export declare class FunctionNode {
    type: 'Function';
    data: string;
    dataArgs: INode[];
    constructor(a: string, args: INode[]);
    toArray(): ToArray;
    toString(): string;
    calculate(mathLibs?: MathLib[]): any;
}
export declare class OperationNode {
    type: 'Operation';
    data: string;
    dataLeft: INode | undefined;
    dataRight: INode | undefined;
    constructor(operator: string, right: INode | undefined, left: INode | undefined);
    toArray(): ToArray;
    toString(): string;
    calculate(mathLibs?: MathLib[]): any;
}
export {};
