import { Operation, Insert, Delete, ISerializedOperation } from '../src/charwise';

export function checkSerializedOperationEquality(
  a: ISerializedOperation,
  b: ISerializedOperation,
): void {
  expect(a.type).toBe(b.type);
  expect(a.position).toBe(b.position);
  expect(a.id).toBe(b.id);
  expect(a.char).toBe(b.char);
}

export function checkOperationEquality(a: Operation, b: Operation): void {
  checkSerializedOperationEquality(a, b);
  expect(a.isNoop).toBe(b.isNoop);
}

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
