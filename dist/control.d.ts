export interface IOperation {
    historyBuffer: string[];
    id: string;
}
export declare class OT<T extends IOperation> {
    private inclusionTransform;
    private exclusionTransform;
    siteID: number;
    static operationsAreIndependent(op1: IOperation, op2: IOperation): boolean;
    readonly historyBuffer: T[];
    private idHistory;
    constructor(inclusionTransform: (op1: T, op2: T) => T, exclusionTransform: (op1: T, op2: T) => T, siteID: number);
    addToHistory(op: T): void;
    history(): string[];
    transpose(op1: T, op2: T): [T, T];
    listTranspose(start: number, end: number): void;
    listInclusionTransform(operation: T, start: number): T;
    goto(operation: T): T;
}
