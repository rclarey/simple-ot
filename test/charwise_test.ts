import {
  Delete,
  Insert,
  OperationType,
  deserialize,
  exclusionTransform,
  inclusionTransform,
  serialize,
} from "../charwise.ts";
import { itCases, etCases } from "./charwiseCases.ts";
import {
  checkOperationEquality,
  checkSerializedOperationEquality,
} from "./common.ts";

for (const testCase of itCases) {
  Deno.test(`inclusionTransform - should transform the ${testCase.name} case`, () => {
    const result = inclusionTransform(testCase.op1, testCase.op2);
    checkOperationEquality(result, testCase.op3);
  });

  Deno.test(`inclusionTransform - should transform the ${testCase.name} case so it is reversible`, () => {
    const itResult = inclusionTransform(testCase.op1, testCase.op2);
    const etResult = exclusionTransform(itResult, testCase.op2);
    checkOperationEquality(etResult, testCase.op1);
  });
}

for (const testCase of etCases) {
  Deno.test(`exclusionTransform - should transform the ${testCase.name} case correctly`, () => {
    const result = exclusionTransform(testCase.op1, testCase.op2);
    checkOperationEquality(result, testCase.op3);
  });
}

for (const testCase of etCases) {
  Deno.test(`exclusionTransform - should transform the ${testCase.name} case so it is reversible`, () => {
    const etResult = exclusionTransform(testCase.op1, testCase.op2);
    const itResult = inclusionTransform(etResult, testCase.op2);
    checkOperationEquality(itResult, testCase.op1);
  });
}

const del = new Delete(1, "1", 0, []);
const ins = new Insert("a", 1, "0", 0, []);
const serialDel = {
  historyBuffer: [] as string[],
  id: "1",
  position: 1,
  siteID: 0,
  type: OperationType.DELETE,
};
const serialIns = {
  char: "a",
  historyBuffer: [] as string[],
  id: "0",
  position: 1,
  siteID: 0,
  type: OperationType.INSERT,
};

Deno.test("deserialize - should deserialize deletion operations correctly", () => {
  checkOperationEquality(deserialize(serialDel), del);
});

Deno.test("deserialize - should deserialize insertion operations correctly", () => {
  checkOperationEquality(deserialize(serialIns), ins);
});

Deno.test("deserialize - should be reversible via serialize", () => {
  checkSerializedOperationEquality(
    serialize(deserialize(serialIns)),
    serialIns,
  );
  checkSerializedOperationEquality(
    serialize(deserialize(serialDel)),
    serialDel,
  );
});

Deno.test("serialize - should serialize deletion operations correctly", () => {
  checkSerializedOperationEquality(serialize(del), serialDel);
});

Deno.test("serialize - should serialize insertion operations correctly", () => {
  checkSerializedOperationEquality(serialize(ins), serialIns);
});

Deno.test("serialize - should be reversible via deserialize", () => {
  checkOperationEquality(deserialize(serialize(ins)), ins);
  checkOperationEquality(deserialize(serialize(del)), del);
});
