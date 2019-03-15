import { inclusionTransform, exclusionTransform } from '../src/transform';
import { itCases, etCases } from './transformCases';
import { checkOperationEquality } from './common';

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
