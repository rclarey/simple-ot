import { IOperation } from "./control";
export declare enum OperationType {
    DELETE = "d",
    INSERT = "i"
}
export declare class Operation implements IOperation {
    type: OperationType;
    position: number;
    id: string;
    siteID: number;
    historyBuffer: string[];
    isNoop: boolean;
    auxPos: number;
    protected constructor(type: OperationType, position: number, id: string, siteID: number, historyBuffer: string[], isNoop: boolean);
}
export declare class Insert extends Operation {
    char: string;
    constructor(char: string, position: number, id: string, siteID: number, historyBuffer: string[], isNoop?: boolean);
}
export declare class Delete extends Operation {
    constructor(position: number, id: string, siteID: number, historyBuffer: string[], isNoop?: boolean);
}
export declare function inclusionTransform(op1: Operation, op2: Operation): Operation;
export declare function exclusionTransform(op1: Operation, op2: Operation): Operation;
export interface ISerializedOperation extends IOperation {
    char?: string;
    position: number;
    siteID: number;
    type: OperationType;
}
export declare function serialize(operation: Operation): ISerializedOperation;
export declare function deserialize(op: ISerializedOperation): Operation;
