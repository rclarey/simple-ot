import { Arbiter, Operation, Insert, Delete } from 'types';

/**
 * Transforms op1 against op2 such that the impact of op2
 * is effectively included in op1
 *
 * @param {Operation} op1 - the operation to transform
 * @param {Operation} op2 - the operation to transform op1 against
 * @param {Arbiter} side - decides whether op1 (left) or op2 (right) wins in the case of
 *   position collisions with operations of the same type
 * @returns {Operation} the result of op1 transformed against op2
 */
export const inclusionTransform = (op1: Operation, op2: Operation, side: Arbiter): Operation => {
  if (op1.isNoop) {
    if (op1 instanceof Delete && op2 instanceof Insert && op1.p === op2.p) {
      return new Delete(op1.p, op1.ts, op1.hb);
    }

    return op1;
  }

  if (op2.isNoop) {
    if (op1 instanceof Insert && op2 instanceof Delete && op1.p === op2.auxPos) {
      return new Insert(op1.c, op1.p, op1.ts, op1.hb, true);
    }

    return op1;
  }

  if (op1 instanceof Insert && op2 instanceof Insert) {
    if (op1.p < op2.p || (op1.p === op2.p && side === Arbiter.LEFT)) {
      return new Insert(op1.c, op1.auxPos, op1.ts, op1.hb);
    }

    return new Insert(op1.c, op1.auxPos + 1, op1.ts, op1.hb);
  }

  if (op1 instanceof Insert && op2 instanceof Delete) {
    if (op1.p <= op2.p) {
      return op1;
    }

    const op3 = new Insert(op1.c, op1.p - 1, op1.ts, op1.hb);
    op3.auxPos = op1.p;
    return op3;
  }

  if (op1 instanceof Delete && op2 instanceof Insert) {
    if (op1.p < op2.p) {
      return op1;
    }

    return new Delete(op1.p + 1, op1.ts, op1.hb);
  }

  if (op1 instanceof Delete && op2 instanceof Delete) {
    if (op1.p === op2.p) {
      return new Delete(op1.p, op1.ts, op1.hb, true);
    }

    if (op1.p < op2.p) {
      return op1;
    }

    const op3 = new Delete(op1.p - 1, op1.ts, op1.hb);
    op3.auxPos = op1.p;
    return op3;
  }

  return op1;
};

/**
 * Transforms op1 against op2 such that the impact of op2
 * is effectively excluded from op1
 *
 * @param {Operation} op1 - the operation to transform
 * @param {Operation} op2 - the operation to transform op1 against
 * @param {Arbiter} side - decides whether op1 (left) or op2 (right) wins in the case of
 *   position collisions with operations of the same type
 * @returns {Operation} the result of op1 transformed against op2
 */
export const exclusionTransform = (op1: Operation, op2: Operation, side: Arbiter): Operation => {
  if (op1.isNoop) {
    if (op2.isNoop && op1.p === op2.p && op1 instanceof Insert && op2 instanceof Delete) {
      return new Insert(op1.c, op1.p, op1.ts, op1.hb);
    }

    if (op1.p === op2.p && op1 instanceof Delete && op2 instanceof Delete) {
      return new Delete(op1.p, op1.ts, op1.hb);
    }

    if (op1 instanceof Delete && op2 instanceof Insert) {
      const op = new Delete(op1.p, op1.ts, op1.hb, true);
      op.auxPos = -1;
      return op;
    }

    return op1;
  }

  if (op2.isNoop) {
    return op1;
  }

  if (op1 instanceof Insert && op2 instanceof Insert) {
    if (op1.p === op2.p && side === Arbiter.RIGHT) {
      const op3 = new Insert(op1.c, op1.p, op1.ts, op1.hb);
      op3.auxPos = op1.p - 1;
      return op3;
    }

    if (op1.p <= op2.p) {
      return op1;
    }

    const op3 = new Insert(op1.c, op1.p - 1, op1.ts, op1.hb);
    if (side === Arbiter.LEFT) {
      op3.auxPos = op1.p;
    }

    return op3;
  }

  if (op1 instanceof Insert && op2 instanceof Delete) {
    if (op1.p === op2.p) {
      return new Insert(op1.c, op1.auxPos, op1.ts, op1.hb);
    }

    if (op1.p < op2.p) {
      return op1;
    }

    return new Insert(op1.c, op1.p + 1, op1.ts, op1.hb);
  }

  if (op1 instanceof Delete && op2 instanceof Insert) {
    if (op1.p === op2.p) {
      return new Delete(op1.p, op1.ts, op1.hb, true);
    }

    if (op1.p < op2.p) {
      return op1;
    }

    return new Delete(op1.p - 1, op1.ts, op1.hb);
  }

  if (op1 instanceof Delete && op2 instanceof Delete) {
    if (op1.p >= op2.p) {
      return new Delete(op1.p + 1, op1.ts, op1.hb);
    }

    return new Delete(op1.p, op1.ts, op1.hb);
  }

  return op1;
};
