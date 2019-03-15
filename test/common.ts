import { Operation, Insert, Delete } from '../src/types';

export const checkOperationEquality = (a: Operation, b: Operation): void => {
  expect(a.type).toBe(b.type);
  expect(a.position).toBe(b.position);
  expect(a.isNoop).toBe(b.isNoop);
  expect(a.id).toBe(b.id);

  if (a instanceof Insert && b instanceof Insert) {
    expect(a.char).toBe(b.char);
  }
};

export const applyOps = (s: string, ops: Operation[]): string => {
  let out = s;
  for (const op of ops) {
    if (!op.isNoop) {
      if (op.position > out.length) {
        throw new Error(`op.position=${op.position} is out of bounds in ${out}`);
      } else {
        if (op instanceof Insert) {
          out = `${out.slice(0, op.position)}${op.char}${out.slice(op.position)}`;
        }
        if (op instanceof Delete) {
          out = `${out.slice(0, op.position)}${out.slice(op.position + 1)}`;
        }
      }
    }
  }

  return out;
};
