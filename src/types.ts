export enum Arbiter {
  LEFT = 'l',
  RIGHT = 'r',
}

export enum OperationType {
  INSERT = 'i',
  DELETE = 'd',
}

/** A plaintext operation */
export class Operation {
  /** Auxillary position information to allow IT/ET to be reversible */
  public auxPos: number;
  /**
   * @param {OperationType} t - the type of operation; either insert or delete. This is needed
   *   for type information to be preserved when sending operations to and from a server
   * @param {number} p - the position of this operation as an offset from the beginning
   *   of the document
   * @param {number} ts - a Unix timestamp of when this operation was initially created
   * @param {Operation[]} hb - the context this operation was created in
   * @param {boolean} isNoop - whether this operation actually is a no-op
   */
  protected constructor(
    public t: OperationType,
    public p: number,
    public ts: number,
    public hb: Operation[],
    public isNoop: boolean,
  ) {
    this.auxPos = p;
  }
}

/** An insert operation */
export class Insert extends Operation {
  /**
   * @param {string} c - the character this operation inserts
   * @param {number} position - where the operation starts in the document
   * @param {number} timestamp - a Unix timestamp of when this operation was initially created
   * @param {Operation[]} histroyBuffer - the context this operation was created in
   */
  constructor(
    public c: string,
    position: number,
    timestamp: number,
    historyBuffer: Operation[],
    isNoop: boolean = false,
  ) {
    super(OperationType.INSERT, position, timestamp, historyBuffer, isNoop);
  }
}

/** A delete TextOperation */
export class Delete extends Operation {
  /**
   * @param {number} position - where the operation starts in the document
   * @param {number} timestamp - a Unix timestamp of when this operation was initially created
   * @param {Operation[]} histroyBuffer - the context this operation was created in
   */
  constructor(
    position: number,
    timestamp: number,
    historyBuffer: Operation[],
    isNoop: boolean = false,
  ) {
    super(OperationType.DELETE, position, timestamp, historyBuffer, isNoop);
  }
}
