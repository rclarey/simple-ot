import { Arbiter, Operation, OperationType, Insert, Delete } from 'types';

export class OT {
  /** The history buffer at this site */
  public historyBuffer: Operation[] = [];
  /**
   * @param {(op1: Operation, op2: Operation, side: Arbiter) => Operation} inclusionTransform
   *   - the inclusion transformation function to use
   * @param {(op1: Operation, op2: Operation, side: Arbiter) => Operation} exclusionTransform
   *   - the exclusion transformation function to use
   * @param {number} siteId - the id of the site at which this is being run. Used for arbitration
   */
  constructor(
    private inclusionTransform: (op1: Operation, op2: Operation, side: Arbiter) => Operation,
    private exclusionTransform: (op1: Operation, op2: Operation, side: Arbiter) => Operation,
    private siteId: number,
  ) {}

  /**
   * Check if op1 is dependent on or independent of op2
   *
   * @param {Operation} op1 - the operation we are currently handling
   * @param {Operation} op2 - the operation to compare `op1` to
   * @returns true if op1 is independent of op2; false if op1 is dependent on op2
   */
  public static operationsAreIndependent(op1: Operation, op2: Operation): boolean {
    for (let i = 0; i < op1.hb.length; i += 1) {
      const cur = op1.hb[i];
      if (cur.ts === op2.ts && cur.t === op2.t) {
        return false;
      }
    }

    return true;
  }

  /**
   * Swap two operations in an execution context
   *
   * @param {Operation} op1 - the operation that occurs earlier in the execution context
   * @param {Operation} op2 - the operation that occurs later in the execution context
   * @returns {[Operation, Operation]} the two input operations, swapped
   */
  public transpose(op1: Operation, op2: Operation): [Operation, Operation] {
    const side = op1.p === op2.p ? Arbiter.RIGHT : Arbiter.LEFT;
    const op2Prime = this.exclusionTransform(op2, op1, Arbiter.LEFT);
    const op1Prime = this.inclusionTransform(op1, op2Prime, side);
    return [op2Prime, op1Prime];
  }

  /**
   * Transpose the operation at `historyBuffer[end]` backwards so that it is at
   * `historyBuffer[start]`. This mutates `this.historyBuffer`.
   *
   * @param {number} start - the start of the range of transposition
   * @param {number} end - the end of the range of transposition
   */
  public listTranspose(start: number, end: number): void {
    const hb = this.historyBuffer;
    for (let i = end; i > start; i -= 1) {
      const result = this.transpose(hb[i - 1], hb[i]);
      [hb[i - 1], hb[i]] = result;
    }
  }

  /**
   * Perform inclusion transforms on `operation` against the operations from `start` to `end`
   * (inclusive) in `list`
   * @param {Operation} operation - the operation to transform
   * @param {Operation[]} list - the list of operations to transform `operation` against
   * @param {number} start - index to start at
   * @param {number} end - index to end at
   * @returns {Operation} the result of `operation` transformed against `list` from `start` to `end`
   */
  public listInclusionTransform(operation: Operation, opSiteId: number, start: number): Operation {
    let transformed = operation;

    // transform operation from `start` to `end` in order
    for (let i = start; i < this.historyBuffer.length; i += 1) {
      const side = opSiteId < this.siteId ? Arbiter.LEFT : Arbiter.RIGHT;
      transformed = this.inclusionTransform(transformed, this.historyBuffer[i], side);
    }

    return transformed;
  }

  /**
   * Transform an operation so that it "makes sense" in the given context.
   * More specifically, given `operation` and an execution context, `list`,
   * generate the execution form of `operation`
   *
   * @param {Operation} rawOperation - the raw operation we recieved from another site,
   *   which we want to execute
   * @param {number} opSiteId - the id of the site where `operation` was created
   * @returns {Operation} `operation` transformed so that it can be executed in `list`
   */
  public goto(rawOperation: Operation, opSiteId: number): Operation {
    // Ensure that an operation recieved over a network has proper prototype information
    const toOpClassInstance = (rawOp: Operation): Operation => {
      if (rawOp.t === OperationType.INSERT) {
        const op = rawOp as Insert;
        return new Insert(op.c, op.p, op.ts, op.hb);
      }

      const op = rawOp as Delete;
      return new Delete(op.p, op.ts, op.hb);
    };
    const operation = toOpClassInstance(rawOperation);

    // find the first operation that is independent with `operation`
    let k = -1;
    for (let i = 0; i < this.historyBuffer.length; i += 1) {
      if (OT.operationsAreIndependent(operation, this.historyBuffer[k])) {
        k = i;
        break;
      }
    }

    // if no operation in `list` is independent with `operation` then the execution form of
    // `operation` is `operation`
    if (k === -1) {
      return operation;
    }

    // scan from k + 1 to the end of `list` to find all operations causally
    // preceding `operation`
    const pre: number[] = [];
    for (let i = k + 1; i < this.historyBuffer.length; i += 1) {
      if (!OT.operationsAreIndependent(operation, this.historyBuffer[i])) {
        pre.push(i);
      }
    }

    // if no operation from k + 1 to the end of `list` causally precedes `operation`, then to
    // get the execution form of `operation` simply perform an inclusion transform on `operation`
    // against every operation from k to the end of `list` in order
    if (pre.length === 0) {
      return this.listInclusionTransform(operation, opSiteId, k);
    }

    // otherwise there IS one or more operations that causually precede 'operation', and
    // we must transpose those so that they are all contiguous
    const r = pre.length;
    for (let i = 0; i < r; i += 1) {
      this.listTranspose(k + i, pre[i]);
    }

    // simply perform an inclusion transform on `operation` against every operation from `k`
    // to `r` in `list` in order
    return this.listInclusionTransform(operation, opSiteId, k + r);
  }
}
