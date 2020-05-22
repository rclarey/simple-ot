import {
  assertEquals,
} from "https://deno.land/std@0.52.0/testing/asserts.ts#^";

import {
  Operation,
  Insert,
  Delete,
  ISerializedOperation,
} from "../charwise.ts";

export function checkSerializedOperationEquality(
  a: ISerializedOperation,
  b: ISerializedOperation,
): void {
  assertEquals(a.type, b.type);
  assertEquals(a.position, b.position);
  assertEquals(a.id, b.id);
  assertEquals(a.char, b.char);
}

export function checkOperationEquality(a: Operation, b: Operation): void {
  checkSerializedOperationEquality(a, b);
  assertEquals(a.isNoop, b.isNoop);
}

export const applyOps = (s: string, ops: Operation[]): string => {
  let out = s;
  for (const op of ops) {
    if (!op.isNoop) {
      if (op.position > out.length) {
        throw new Error(
          `op.position=${op.position} is out of bounds in ${out}`,
        );
      } else {
        if (op instanceof Insert) {
          out = `${out.slice(0, op.position)}${op.char}${
            out.slice(op.position)
          }`;
        }
        if (op instanceof Delete) {
          out = `${out.slice(0, op.position)}${out.slice(op.position + 1)}`;
        }
      }
    }
  }

  return out;
};
