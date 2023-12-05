export declare const arrayConcat: {
    (...items: ConcatArray<any>[]): any[];
    (...items: any[]): any[];
};
declare function concat<T>(...args: (T | T[])[]): T[];
export { concat };
export declare function last<T>(a: T[]): T | undefined;
export declare const arrayPush: (...items: any[]) => number;
export declare function isFunction(v: any): v is Function;
export declare const objectHasOwn: (o: object, v: PropertyKey) => boolean;
