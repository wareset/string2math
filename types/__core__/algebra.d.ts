export declare type Raw = {
    isNaN: boolean;
    isMinus: boolean;
    isInfinity: boolean;
    integer: string;
    exponent: number;
};
export declare function num2raw(s: number): Raw;
export declare function raw2num(raw: Raw): number;
export declare function exp(l: number, r: number): number;
export declare function mul(_l: number, _r: number): number;
export declare function div(_l: number, _r: number): number;
export declare function rem(_l: number, _r: number): number;
export declare function add(_l: number, _r: number): number;
export declare function sub(_l: number, _r: number): number;
