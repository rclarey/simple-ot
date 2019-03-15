export enum OperationType {
  INSERT = 'i',
  DELETE = 'd',
}

/** A plaintext operation */
export class Operation {
  /** Auxillary position information to allow IT/ET to be reversible */
  public auxPos: number;
  /**
   * @param {OperationType} type - the type of operation; either insert or delete. This is needed
   *   for type information to be preserved when sending operations to and from a server
   * @param {number} position - the position of this operation as an offset from the beginning
   *   of the document
   * @param {number} id - a unique identifier for this operation
   * @param {number} siteID - the id of the site where this operation was generated
   * @param {Operation[]} historyBuffer - the context this operation was created in
   * @param {boolean} isNoop - whether this operation actually is a no-op
   */
  protected constructor(
    public type: OperationType,
    public position: number,
    public id: number,
    public siteID: number,
    public historyBuffer: Operation[],
    public isNoop: boolean,
  ) {
    this.auxPos = position;
  }
}

/** An insert operation */
export class Insert extends Operation {
  /**
   * @param {string} char - the character this operation inserts
   * @param {number} position - where the operation starts in the document
   * @param {number} id - a unique identifier for this operation
   * @param {number} siteId - the id of the site where this operation was generated
   * @param {Operation[]} histroyBuffer - the context this operation was created in
   */
  constructor(
    public char: string,
    position: number,
    id: number,
    siteId: number,
    historyBuffer: Operation[],
    isNoop: boolean = false,
  ) {
    super(OperationType.INSERT, position, id, siteId, historyBuffer, isNoop);
  }
}

/** A delete TextOperation */
export class Delete extends Operation {
  /**
   * @param {number} position - where the operation starts in the document
   * @param {number} id - a unique identifier for this operation
   * @param {number} siteId - the id of the site where this operation was generated
   * @param {Operation[]} histroyBuffer - the context this operation was created in
   */
  constructor(
    position: number,
    id: number,
    siteId: number,
    historyBuffer: Operation[],
    isNoop: boolean = false,
  ) {
    super(OperationType.DELETE, position, id, siteId, historyBuffer, isNoop);
  }
}
