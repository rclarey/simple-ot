import {
  Delete,
  Insert,
  OperationType,
  deserialize,
  exclusionTransform,
  inclusionTransform,
  serialize,
} from '../src/charwise';
import { itCases, etCases } from './charwiseCases';
import { checkOperationEquality, checkSerializedOperationEquality } from './common';

describe('inclusionTransform', () => {
  for (const testCase of itCases) {
    it(`should transform the ${testCase.name} case correctly`, () => {
      const result = inclusionTransform(testCase.op1, testCase.op2);
      checkOperationEquality(result, testCase.op3);
    });
  }

  for (const testCase of itCases) {
    it(`should transform the ${testCase.name} case so it is reversible`, () => {
      const itResult = inclusionTransform(testCase.op1, testCase.op2);
      const etResult = exclusionTransform(itResult, testCase.op2);
      checkOperationEquality(etResult, testCase.op1);
    });
  }
});

describe('exclusionTransform', () => {
  for (const testCase of etCases) {
    it(`should transform the ${testCase.name} case correctly`, () => {
      const result = exclusionTransform(testCase.op1, testCase.op2);
      checkOperationEquality(result, testCase.op3);
    });
  }

  for (const testCase of etCases) {
    it(`should transform the ${testCase.name} case so it is reversible`, () => {
      const etResult = exclusionTransform(testCase.op1, testCase.op2);
      const itResult = inclusionTransform(etResult, testCase.op2);
      checkOperationEquality(itResult, testCase.op1);
    });
  }
});

const del = new Delete(1, 1, 0, []);
const ins = new Insert('a', 1, 0, 0, []);
const serialDel = {
  historyBuffer: [] as number[],
  id: 1,
  position: 1,
  siteID: 0,
  type: OperationType.DELETE,
};
const serialIns = {
  char: 'a',
  historyBuffer: [] as number[],
  id: 0,
  position: 1,
  siteID: 0,
  type: OperationType.INSERT,
};

describe('deserialize', () => {
  it('should deserialize deletion operations correctly', () => {
    checkOperationEquality(deserialize(serialDel), del);
  });

  it('should deserialize insertion operations correctly', () => {
    checkOperationEquality(deserialize(serialIns), ins);
  });

  it('should be reversible via serialize', () => {
    checkSerializedOperationEquality(serialize(deserialize(serialIns)), serialIns);
    checkSerializedOperationEquality(serialize(deserialize(serialDel)), serialDel);
  });
});

describe('serialize', () => {
  it('should serialize deletion operations correctly', () => {
    checkSerializedOperationEquality(serialize(del), serialDel);
  });

  it('should serialize insertion operations correctly', () => {
    checkSerializedOperationEquality(serialize(ins), serialIns);
  });

  it('should be reversible via deserialize', () => {
    checkOperationEquality(deserialize(serialize(ins)), ins);
    checkOperationEquality(deserialize(serialize(del)), del);
  });
});
