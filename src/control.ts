import { Arbiter, Operation, OperationType, Insert, Delete } from 'types';

/**
 * The class to be used as a singleton object to perform operational transform tasks at a
 * specific site.
 *
 * The class provides a high-level control algorithm for operational transform via its `goto`
 * method that is agnostic to the specific `inclusionTransform` and `exclusionTransform` used.
 *
 * Provided `inclusionTransform` and `exclusionTransform` functions should fulfil the preconditions
 * and postconditions specified in `src/transform.ts`.
 */
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
    public siteID: number,
  ) {}

  /**
   * Check if `op1` is dependent on or independent of `op2`.
   *
   * This is done by checking if `op1`'s definition context (`op1.hb`) contains `op2`;
   * if it does clearly `op1` is dependent on `op2`, otherwise `op1` is independent of `op2`
   *
   * @param {Operation} op1 - the operation we are currently handling
   * @param {Operation} op2 - the operation to compare `op1` to
   * @returns true if `op1` is independent of `op2`; false if `op1` is dependent on `op2`
   */
  public static operationsAreIndependent(op1: Operation, op2: Operation): boolean {
    for (let i = 0; i < op1.historyBuffer.length; i += 1) {
      const cur = op1.historyBuffer[i];
      if (cur.id === op2.id && cur.id === op2.id) {
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
    const side = op1.position === op2.position ? Arbiter.RIGHT : Arbiter.LEFT;
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
   * Perform inclusion transforms on `operation` against the operations from `start` to
   * the end of `historyBuffer`
   * @param {Operation} operation - the operation to transform
   * @param {number} start - index to start at
   * @returns {Operation} the result of `operation` transformed against `historyBuffer` from
   *   `start` to its end
   */
  public listInclusionTransform(operation: Operation, start: number): Operation {
    let transformed = operation;

    // transform operation from `start` to `end` in order
    for (let i = start; i < this.historyBuffer.length; i += 1) {
      const op2 = this.historyBuffer[i];
      const side = operation.siteID < op2.siteID ? Arbiter.LEFT : Arbiter.RIGHT;
      transformed = this.inclusionTransform(transformed, op2, side);
    }

    return transformed;
  }

  /**
   * Transform an operation so that it "makes sense" in the given context.
   * More specifically, given `operation` and an execution context, `historyBuffer`,
   * generate the execution form of `operation`
   *
   * @param {Operation} rawOperation - the potentially stringified version of `operation`
   *   we recieved from another site, which we want to execute
   * @returns {Operation} `operation` transformed so that it can be executed in `historyBuffer`
   */
  public goto(rawOperation: Operation): Operation {
    // Ensure that an operation recieved over a network has proper prototype information
    const toOpClassInstance = (rawOp: Operation): Operation => {
      if (rawOp.type === OperationType.INSERT) {
        const op = rawOp as Insert;
        return new Insert(op.char, op.position, op.id, op.siteID, op.historyBuffer);
      }

      const op = rawOp as Delete;
      return new Delete(op.position, op.id, op.siteID, op.historyBuffer);
    };
    const operation = toOpClassInstance(rawOperation);

    // find the first operation that is independent with `operation`
    let k = -1;
    for (let i = 0; i < this.historyBuffer.length; i += 1) {
      if (OT.operationsAreIndependent(operation, this.historyBuffer[i])) {
        k = i;
        break;
      }
    }

    // if no operation in `historyBuffer` is independent with `operation` then the execution form
    // of `operation` is `operation`
    if (k === -1) {
      return operation;
    }

    // scan from k + 1 to the end of `historyBuffer` to find all operations causally
    // preceding `operation`
    const pre: number[] = [];
    for (let i = k + 1; i < this.historyBuffer.length; i += 1) {
      if (!OT.operationsAreIndependent(operation, this.historyBuffer[i])) {
        pre.push(i);
      }
    }

    // if no operation from k + 1 to the end of `historyBuffer` causally precedes `operation`, then
    // to get the execution form of `operation` simply perform an inclusion transform on `operation`
    // against every operation from k to the end of `historyBuffer` in order
    if (pre.length === 0) {
      return this.listInclusionTransform(operation, k);
    }

    // otherwise there IS one or more operations that causually precede `operation`, and
    // we must transpose those so that they are all contiguous and directly after the
    // first `k` operations that also causually precede `operation`
    const r = pre.length;
    for (let i = 0; i < r; i += 1) {
      this.listTranspose(k + i, pre[i]);
    }

    // simply perform an inclusion transform on `operation` against every operation from index
    // `k+r` to the end of `historyBuffer` in order
    return this.listInclusionTransform(operation, k + r);
  }
}
