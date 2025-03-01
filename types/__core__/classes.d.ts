type INode = OperatorNode | FunctionNode | VariableNode | ConstantNode | ConditionNode | undefined;
type MathLib = {
    [key: string]: any;
};
interface Node {
    type: string;
    toArray(): ToArray;
    toString(): string;
    calculate(...mathLibs: MathLib[]): any;
}
type ToArray = (string | number)[];
export declare class ProgramNode implements Node {
    readonly type: 'Program';
    nodeChild: INode;
    constructor(nodeChild: INode);
    toArray(): ToArray;
    toString(): string;
    calculate(...mathLibs: MathLib[]): any;
}
export declare class ConditionNode implements Node {
    readonly type: 'Condition';
    nodeIf: INode;
    nodeThen: INode;
    nodeElse: INode;
    constructor(nodeIf: INode, nodeThen: INode, nodeElse: INode);
    toArray(): ToArray;
    toString(): string;
    calculate(...mathLibs: MathLib[]): any;
}
export declare class VariableNode implements Node {
    readonly type: 'Variable';
    variable: string;
    constructor(variable: string);
    toArray(): ToArray;
    toString(): string;
    calculate(...mathLibs: MathLib[]): any;
}
export declare class ConstantNode implements Node {
    readonly type: 'Constant';
    constant: number;
    constructor(constant: number);
    toArray(): ToArray;
    toString(): string;
    calculate(): any;
}
export declare class FunctionNode implements Node {
    readonly type: 'Function';
    function: string;
    nodeListOfArgs: INode[];
    constructor(fname: string, nodes: INode[]);
    toArray(): ToArray;
    toString(): string;
    calculate(...mathLibs: MathLib[]): any;
}
export declare class OperatorNode implements Node {
    readonly type: 'Operator';
    operator: string;
    nodeLeft: INode;
    nodeRight: INode;
    constructor(operator: string, nodeLeft: INode, nodeRight: INode);
    toArray(): ToArray;
    toString(): string;
    calculate(...mathLibs: MathLib[]): any;
}
export {};
