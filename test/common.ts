import { Operation, Insert, Delete } from '../src/types';

export const checkOperationEquality = (a: Operation, b: Operation): void => {
  expect(a.t).toBe(b.t);
  expect(a.p).toBe(b.p);
  expect(a.isNoop).toBe(b.isNoop);
  expect(a.ts).toBe(b.ts);

  if (a instanceof Insert && b instanceof Insert) {
    expect(a.c).toBe(b.c);
  }
};

export const applyOps = (s: string, ops: Operation[]): string => {
  let out = s;
  for (const op of ops) {
    if (!op.isNoop) {
      if (op.p > out.length) {
        throw new Error(`op.p=${op.p} is out of bounds in ${out}`);
      } else {
        if (op instanceof Insert) {
          out = `${out.slice(0, op.p)}${op.c}${out.slice(op.p)}`;
        }
        if (op instanceof Delete) {
          out = `${out.slice(0, op.p)}${out.slice(op.p + 1)}`;
        }
      }
    }
  }

  return out;
};
