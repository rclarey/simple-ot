import { IOperation } from './control';

/** The type of an operation. Either insert or delete */
export enum OperationType {
  INSERT = 'i',
  DELETE = 'd',
}

/** A character-wise plaintext operation */
export class Operation implements IOperation {
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
    public historyBuffer: number[],
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
   * @param {number} siteID - the id of the site where this operation was created
   * @param {Operation[]} histroyBuffer - the context this operation was created in
   */
  constructor(
    public char: string,
    position: number,
    id: number,
    siteID: number,
    historyBuffer: number[],
    isNoop: boolean = false,
  ) {
    super(OperationType.INSERT, position, id, siteID, historyBuffer, isNoop);
  }
}

/** A delete TextOperation */
export class Delete extends Operation {
  /**
   * @param {number} position - where the operation starts in the document
   * @param {number} id - a unique identifier for this operation
   * @param {number} siteID - the id of the site where this operation was created
   * @param {Operation[]} histroyBuffer - the context this operation was created in
   */
  constructor(
    position: number,
    id: number,
    siteID: number,
    historyBuffer: number[],
    isNoop: boolean = false,
  ) {
    super(OperationType.DELETE, position, id, siteID, historyBuffer, isNoop);
  }
}

/**
 * Transforms op1 against op2 such that the impact of op2
 * is effectively included in op1
 *
 * @param {Operation} op1 - the operation to transform
 * @param {Operation} op2 - the operation to transform op1 against
 * @returns {Operation} the result of op1 transformed against op2
 */
export function inclusionTransform(op1: Operation, op2: Operation): Operation {
  if (op1.isNoop) {
    if (op1 instanceof Delete && op2 instanceof Insert && op1.position === op2.position) {
      return new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer);
    }

    return op1;
  }

  if (op2.isNoop) {
    if (op1 instanceof Insert && op2 instanceof Delete && op1.position === op2.auxPos) {
      return new Insert(op1.char, op1.position, op1.id, op1.siteID, op1.historyBuffer, true);
    }

    return op1;
  }

  if (op1 instanceof Insert && op2 instanceof Insert) {
    if (
      op1.position < op2.position ||
      (op1.position === op2.position && op1.siteID <= op2.siteID)
    ) {
      return new Insert(op1.char, op1.auxPos, op1.id, op1.siteID, op1.historyBuffer);
    }

    const pos = Math.min(op1.position, op1.auxPos) + 1;
    return new Insert(op1.char, pos, op1.id, op1.siteID, op1.historyBuffer);
  }

  if (op1 instanceof Insert && op2 instanceof Delete) {
    if (op1.position <= op2.position) {
      return op1;
    }

    const op3 = new Insert(op1.char, op1.position - 1, op1.id, op1.siteID, op1.historyBuffer);
    op3.auxPos = op1.position;
    return op3;
  }

  if (op1 instanceof Delete && op2 instanceof Insert) {
    if (op1.position < op2.position) {
      return op1;
    }

    return new Delete(op1.position + 1, op1.id, op1.siteID, op1.historyBuffer);
  }

  if (op1 instanceof Delete && op2 instanceof Delete) {
    if (op1.position === op2.position) {
      return new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer, true);
    }

    if (op1.position < op2.position) {
      return op1;
    }

    const op3 = new Delete(op1.position - 1, op1.id, op1.siteID, op1.historyBuffer);
    op3.auxPos = op1.position;
    return op3;
  }

  return op1;
}

/**
 * Transforms op1 against op2 such that the impact of op2
 * is effectively excluded from op1
 *
 * @param {Operation} op1 - the operation to transform
 * @param {Operation} op2 - the operation to transform op1 against
 * @returns {Operation} the result of op1 transformed against op2
 */
export function exclusionTransform(op1: Operation, op2: Operation): Operation {
  if (op1.isNoop) {
    if (
      op2.isNoop && op1.position === op2.position &&
      op1 instanceof Insert && op2 instanceof Delete
    ) {
      return new Insert(op1.char, op1.position, op1.id, op1.siteID, op1.historyBuffer);
    }

    if (op1.position === op2.position && op1 instanceof Delete && op2 instanceof Delete) {
      return new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer);
    }

    if (op1 instanceof Delete && op2 instanceof Insert) {
      const op = new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer, true);
      op.auxPos = -1;
      return op;
    }

    return op1;
  }

  if (op2.isNoop) {
    return op1;
  }

  if (op1 instanceof Insert && op2 instanceof Insert) {
    if (op1.position === op2.position && op1.siteID > op2.siteID) {
      const op3 = new Insert(op1.char, op1.position, op1.id, op1.siteID, op1.historyBuffer);
      op3.auxPos = op1.position - 1;
      return op3;
    }

    if (op1.position <= op2.position) {
      op2.auxPos = op2.position + 1;
      return op1;
    }

    const op3 = new Insert(op1.char, op1.position - 1, op1.id, op1.siteID, op1.historyBuffer);
    if (op1.siteID < op2.siteID) {
      op3.auxPos = op1.position;
    }

    return op3;
  }

  if (op1 instanceof Insert && op2 instanceof Delete) {
    if (op1.position === op2.position) {
      return new Insert(op1.char, op1.auxPos, op1.id, op1.siteID, op1.historyBuffer);
    }

    if (op1.position < op2.position) {
      return op1;
    }

    return new Insert(op1.char, op1.position + 1, op1.id, op1.siteID, op1.historyBuffer);
  }

  if (op1 instanceof Delete && op2 instanceof Insert) {
    if (op1.position === op2.position) {
      return new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer, true);
    }

    if (op1.position < op2.position) {
      return op1;
    }

    return new Delete(op1.position - 1, op1.id, op1.siteID, op1.historyBuffer);
  }

  if (op1 instanceof Delete && op2 instanceof Delete) {
    if (op1.position >= op2.position) {
      return new Delete(op1.position + 1, op1.id, op1.siteID, op1.historyBuffer);
    }

    return new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer);
  }

  return op1;
}

/** Strip fields that are used internally for transforms */
export function serialize(op: Operation): Operation {
  delete op.auxPos;
  delete op.isNoop;
  return op;
}

/** Give an operation received as JSON over a network correct type information */
export function deserialize(rawOp: Operation): Operation {
  if (rawOp.type === OperationType.INSERT) {
    const op = rawOp as Insert;
    return new Insert(op.char, op.position, op.id, op.siteID, op.historyBuffer);
  }

  const op = rawOp as Delete;
  return new Delete(op.position, op.id, op.siteID, op.historyBuffer);
}
