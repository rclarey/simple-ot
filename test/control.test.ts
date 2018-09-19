import { Insert, Delete, Operation } from '../src/types';
import { OT } from '../src/control';
import { inclusionTransform, exclusionTransform } from '../src/transform';
import { checkOperationEquality, applyOps } from './common';
import { transposeCases, listTransposeCases } from './controlCases';

const alphabet = 'qwertyuiopasdfghjklzxcvbnm';
const randomTestLimit = 100;

const randIntInRange = (start: number, end: number): number => {
  return start + Math.floor(Math.random() * (end - start));
};

const randomHB = (): { str: string, hb: Operation[] } => {
  const hbSize = randIntInRange(4, 10);
  const hb: Operation[] = [];
  let strSize = randIntInRange(4, 10);
  let str = '';

  for (let i = 0; i < strSize; i += 1) {
    str += alphabet[randIntInRange(0, 25)];
  }

  for (let i = 0; i < hbSize; i += 1) {
    if (Math.random() < 0.5) {
      hb.push(new Insert(
        alphabet[randIntInRange(0, 25)],
        randIntInRange(0, strSize - 1),
        0,
        [],
      ));
      strSize += 1;
    } else {
      hb.push(new Delete(
        randIntInRange(0, strSize - 1),
        0,
        [],
      ));
      strSize -= 1;
    }
  }

  return { str, hb };
};

describe('OT', () => {
  describe('operationAreIndependent', () => {
    it('should return true if op2 does not appear in op1\'s history buffer - 1', () => {
      const op1 = new Delete(0, 0, [
        new Insert('a', 1, 1, []),
        new Delete(7, 2, []),
        new Delete(4, 4, []),
      ]);
      const op2 = new Insert('b', 2, 3, []);

      expect(OT.operationsAreIndependent(op1, op2)).toBe(true);
    });

    it('should return true if op2 does not appear in op1\'s history buffer - 2', () => {
      const op1 = new Delete(0, 0, [
        new Insert('a', 1, 1, []),
        new Delete(7, 2, []),
        new Delete(4, 3, []),
      ]);
      const op2 = new Insert('b', 2, 3, []);

      expect(OT.operationsAreIndependent(op1, op2)).toBe(true);
    });

    it('should return false if op2 appears in op1\'s history buffer', () => {
      const op1 = new Delete(0, 0, [
        new Insert('a', 1, 1, []),
        new Delete(7, 2, []),
        new Insert('b', 2, 3, []),
        new Delete(4, 4, []),
      ]);
      const op2 = new Insert('b', 2, 3, []);

      expect(OT.operationsAreIndependent(op1, op2)).toBe(false);
    });
  });

  describe('transpose', () => {
    for (const testCase of transposeCases) {
      const ot = new OT(inclusionTransform, exclusionTransform, 0);
      const [op2Prime, op1Prime] = ot.transpose(testCase.op1, testCase.op2);

      it(`should swap op1 correctly in the ${testCase.name} case`, () => {
        checkOperationEquality(op1Prime, testCase.op1Prime);
      });

      it(`should swap op2 correctly in the ${testCase.name} case`, () => {
        checkOperationEquality(op2Prime, testCase.op2Prime);
      });
    }
  });

  describe('listTranspose', () => {
    for (const testCase of listTransposeCases) {
      debugger;
      it(`should transpose the list correctly in the ${testCase.name} case`, () => {
        const ot = new OT(inclusionTransform, exclusionTransform, 0);
        ot.historyBuffer = testCase.hb;
        ot.listTranspose(testCase.start, testCase.end);
        expect(applyOps(testCase.str, ot.historyBuffer)).toEqual(testCase.out);
      });
    }

    for (let i = 0; i < randomTestLimit; i += 1) {

      it('should transpose the list correctly in a random case', () => {
        const ot = new OT(inclusionTransform, exclusionTransform, 0);
        const { str, hb } = randomHB();
        const expected = applyOps(str, hb);
        ot.historyBuffer = hb.slice();
        ot.listTranspose(0, hb.length - 1);
        const out = applyOps(str, ot.historyBuffer);

        if (out !== expected) {
          throw new Error(
            `listTranspose failed with:
             str: '${str}'
             hb: ${JSON.stringify(hb, null, 2)}
             transposed hb: ${JSON.stringify(ot.historyBuffer, null, 2)}
             expected: ${expected}
             result: ${out}`,
          );
        } else {
          expect(out).toEqual(expected);
        }
      });
    }
  });
});
