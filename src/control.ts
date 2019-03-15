/**
 * A generic operation interface to be used with the OT class.
 *
 * Specific implementations of `inclusionTransform` and `exclusionTransform` will likely
 * use more specific operation classes that implement this interface. See `src/charwise.ts`
 * for an example.
 */
export interface IOperation {
  /**
   * A stripped down version of the `OT.historyBuffer` that existed at the site where this
   * operation was created, when it was created.
   *
   * This array contains only the IDs of the operations in the original `OT.historyBuffer`.
   */
  historyBuffer: number[];
  /** A unique identifier for this operation */
  id: number;
}

/**
 * The class to be used as a singleton object to perform operational transform tasks at a
 * specific site.
 *
 * The class provides a high-level control algorithm for operational transform via its `goto`
 * method that is agnostic to the specific `inclusionTransform` and `exclusionTransform` used.
 *
 * Provided `inclusionTransform` and `exclusionTransform` functions should satisfy the TP1 and TP2
 * describe at https://en.wikipedia.org/wiki/Operational_transformation#Transformation_properties
 */
export class OT {
  /** The history buffer at this site */
  public historyBuffer: IOperation[] = [];
  /**
   * @param {(op1: IOperation, op2: IOperation) => IOperation} inclusionTransform
   *   - the inclusion transformation function to use
   * @param {(op1: IOperation, op2: IOperation) => IOperation} exclusionTransform
   *   - the exclusion transformation function to use
   * @param {number} siteID - the id of the site at which this is being run. May be used
   *   for arbitration.
   */
  constructor(
    private inclusionTransform: (op1: IOperation, op2: IOperation) => IOperation,
    private exclusionTransform: (op1: IOperation, op2: IOperation) => IOperation,
    public siteID: number,
  ) {}

  /**
   * Check if `op1` is dependent on or independent of `op2`.
   *
   * This is done by checking if `op1`'s definition context (`op1.historyBuffer`) contains `op2`;
   * if it does clearly `op1` is dependent on `op2`, otherwise `op1` is independent of `op2`
   *
   * @param {IOperation} op1 - the operation we are currently handling
   * @param {IOperation} op2 - the operation to compare `op1` to
   * @returns true if `op1` is independent of `op2`; false if `op1` is dependent on `op2`
   */
  public static operationsAreIndependent(op1: IOperation, op2: IOperation): boolean {
    for (let i = 0; i < op1.historyBuffer.length; i += 1) {
      const id = op1.historyBuffer[i];
      if (id === op2.id && id === op2.id) {
        return false;
      }
    }

    return true;
  }

  /**
   * Swap two operations in an execution context
   *
   * @param {IOperation} op1 - the operation that occurs earlier in the execution context
   * @param {IOperation} op2 - the operation that occurs later in the execution context
   * @returns {[IOperation, IOperation]} the two input operations, swapped
   */
  public transpose(op1: IOperation, op2: IOperation): [IOperation, IOperation] {
    const op2Prime = this.exclusionTransform(op2, op1);
    const op1Prime = this.inclusionTransform(op1, op2Prime);
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
   * @param {IOperation} operation - the operation to transform
   * @param {number} start - index to start at
   * @returns {IOperation} the result of `operation` transformed against `historyBuffer` from
   *   `start` to its end
   */
  public listInclusionTransform(operation: IOperation, start: number): IOperation {
    let transformed = operation;

    // transform operation from `start` to `end` in order
    for (let i = start; i < this.historyBuffer.length; i += 1) {
      const op2 = this.historyBuffer[i];
      transformed = this.inclusionTransform(transformed, op2);
    }

    return transformed;
  }

  /**
   * Transform an operation so that it "makes sense" in the given context.
   * More specifically, given `operation` and an execution context, `historyBuffer`,
   * generate the execution form of `operation`
   *
   * @param {IOperation} operation - operation we want to execute
   * @returns {IOperation} `operation` transformed so that it can be executed in `historyBuffer`
   */
  public goto(operation: IOperation): IOperation {
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
