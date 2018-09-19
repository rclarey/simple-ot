export type OneOrTwo<T> = [T]|[T, T];

/** The type of an operation. Either insert or delete */
export enum OperationType {
  INSERT = 'i',
  DELETE = 'd',
}

/** A simple operation on a document */
export interface Operation {
  /** The type of the operation */
  t: OperationType;
  /** The timestamp of the last executed operation at the location this operation was generated */
  pv: number;
  /** The timestamp when this operation was generated */
  v: number;
}
