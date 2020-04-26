import { Insert, Delete, Operation, inclusionTransform, exclusionTransform } from '../src/charwise';
import { OT } from '../src/control';
import { checkOperationEquality, applyOps } from './common';
import { transposeCases, listTransposeCases } from './controlCases';

const alphabet = 'qwertyuiopasdfghjklzxcvbnm';
const randomTestLimit = 1000;

const randIntInRange = (start: number, end: number): number => {
  return start + Math.floor(Math.random() * (end - start));
};

const randomHB = (): { str: string; hb: Operation[] } => {
  const hbSize = randIntInRange(4, 10);
  const hb: Operation[] = [];
  let strSize = randIntInRange(4, 10);
  let str = '';

  for (let i = 0; i < strSize; i += 1) {
    str += alphabet[randIntInRange(0, 26)];
  }

  for (let i = 0; i < hbSize; i += 1) {
    if (Math.random() < 0.5 || strSize === 0) {
      hb.push(new Insert(alphabet[randIntInRange(0, 26)], randIntInRange(0, strSize), '0', 0, []));
      strSize += 1;
    } else {
      hb.push(new Delete(randIntInRange(0, strSize), '0', 0, []));
      strSize -= 1;
    }
  }

  return { str, hb };
};

describe('helpers', () => {
  describe('applyOps', () => {
    it('should ignore noops', () => {
      const result = applyOps('abcd', [
        new Insert('z', 0, '0', 0, [], true),
        new Delete(1, '1', 0, [], true),
      ]);

      expect(result).toEqual('abcd');
    });

    it('should throw if given bad p value', () => {
      const applyBadOp = () =>
        applyOps('abcd', [
          new Insert('z', 4, '0', 0, []),
          new Insert('y', 5, '0', 0, []),
          new Insert('x', 7, '0', 0, []),
        ]);

      expect(applyBadOp).toThrow('op.position=7 is out of bounds in abcdzy');
    });

    it('should properly apply Inserts and Deletes', () => {
      const result = applyOps('abcd', [
        new Insert('z', 0, '0', 0, []),
        new Delete(1, '1', 0, []),
        new Delete(1, '1', 0, []),
      ]);

      expect(result).toEqual('zcd');
    });
  });
});

describe('OT', () => {
  describe('operationsAreIndependent', () => {
    it("should return true if op2 does not appear in op1's history buffer", () => {
      const op1 = new Delete(0, '0', 0, ['1', '0']);
      const op2 = new Insert('b', 2, '3', 0, []);

      expect(OT.operationsAreIndependent(op1, op2)).toBe(true);
    });

    it("should return false if op2 appears in op1's history buffer", () => {
      const op1 = new Delete(0, '0', 0, ['1', '0', '3']);
      const op2 = new Insert('b', 2, '3', 0, []);

      expect(OT.operationsAreIndependent(op1, op2)).toBe(false);
    });
  });

  describe('history', () => {
    it('should return the ids of the operations in historyBuffer', () => {
      const ot = new OT(inclusionTransform, exclusionTransform, 0);
      ot.addToHistory(new Delete(0, '5', 0, []));
      ot.addToHistory(new Insert('a', 1, '7', 0, []));
      ot.addToHistory(new Delete(1, '3', 0, []));
      const history = ot.history();

      expect(history).toHaveLength(3);
      expect(history[0]).toBe('5');
      expect(history[1]).toBe('7');
      expect(history[2]).toBe('3');
    });

    it('should return an empty array when historyBuffer is empty', () => {
      const ot = new OT(inclusionTransform, exclusionTransform, 0);
      const history = ot.history();

      expect(history).toHaveLength(0);
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
      it(`should transpose the list correctly in the ${testCase.name} case`, () => {
        const ot = new OT(inclusionTransform, exclusionTransform, 0);
        testCase.hb.forEach(op => ot.addToHistory(op));
        ot.listTranspose(testCase.start, testCase.end);
        expect(applyOps(testCase.str, ot.historyBuffer)).toEqual(testCase.out);
      });
    }

    for (let i = 0; i < randomTestLimit; i += 1) {
      it('should transpose the list correctly in a random case', () => {
        const ot = new OT(inclusionTransform, exclusionTransform, 0);
        const { str, hb } = randomHB();
        const expected = applyOps(str, hb);
        hb.forEach(op => ot.addToHistory(op));
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

  describe('goto', () => {
    // test the 3 cases defined for the GOT control algorithm in the paper
    it('should pass case 1', () => {
      const ot = new OT(inclusionTransform, exclusionTransform, 0);
      const first = new Insert('x', 0, '0', 0, []);
      const second = new Insert('d', 0, '1', 0, [first.id]);
      const third = new Delete(1, '2', 0, [first.id, second.id]);
      const fourth = new Insert('a', 0, '3', 0, [first.id, second.id, third.id]);
      const fifth = new Insert('b', 1, '4', 0, [first.id, second.id, third.id, fourth.id]);
      [first, second, third, fourth, fifth].forEach(o => ot.addToHistory(o));

      const op = new Insert('c', 2, '5', 1, ot.history());
      const transformed = ot.goto(op);

      checkOperationEquality(transformed, op);
    });

    it('should pass case 2', () => {
      const ot = new OT(inclusionTransform, exclusionTransform, 1);
      const first = new Insert('x', 0, '0', 1, []);
      const second = new Insert('d', 0, '1', 1, [first.id]);
      const third = new Delete(1, '2', 1, [first.id, second.id]);
      const fourth = new Insert('a', 0, '3', 1, [first.id, second.id, third.id]);
      const fifth = new Insert('b', 2, '4', 1, [first.id, second.id, third.id, fourth.id]);
      [first, second, third, fourth, fifth].forEach(o => ot.addToHistory(o));

      const op = new Insert('c', 2, '5', 0, [first.id, second.id]);
      const expected = new Insert('c', 2, '5', 0, [first.id, second.id]);
      const transformed = ot.goto(op);

      checkOperationEquality(transformed, expected);
    });

    it('should pass case 3', () => {
      const ot = new OT(inclusionTransform, exclusionTransform, 0);
      const first = new Insert('x', 0, '0', 0, []);
      const second = new Insert('d', 0, '1', 0, [first.id]);
      const third = new Delete(1, '2', 0, [first.id, second.id]);
      const fourth = new Insert('a', 0, '3', 0, [first.id, second.id, third.id]);
      const fifthFull = new Insert('b', 2, '4', 0, [first.id, second.id, third.id, fourth.id]);
      const fifthOp = new Insert('b', 1, '4', 0, [first.id, second.id, third.id, fourth.id]);
      [first, second, third, fourth, fifthFull].forEach(o => ot.addToHistory(o));

      const op = new Delete(1, '5', 1, [first.id, second.id, fifthOp.id]);
      const expected = new Delete(2, '5', 1, [first.id, second.id, fifthOp.id]);
      const transformed = ot.goto(op);

      checkOperationEquality(transformed, expected);
    });

    // test the case shown in Fig. 2 in the paper (modified to add a server as site 0)
    it('should pass figure 2 case', () => {
      const server = new OT(inclusionTransform, exclusionTransform, 0);
      const site1 = new OT(inclusionTransform, exclusionTransform, 1);
      const site2 = new OT(inclusionTransform, exclusionTransform, 2);
      const site3 = new OT(inclusionTransform, exclusionTransform, 3);

      const o0 = new Insert('a', 0, '0', 0, []);
      server.addToHistory(o0);
      site1.addToHistory(o0);
      site2.addToHistory(o0);
      site3.addToHistory(o0);

      const o2 = new Insert('y', 1, '1', 2, site2.historyBuffer.map(o => o.id));
      const o3 = new Insert('z', 1, '2', 3, site3.historyBuffer.map(o => o.id));
      site2.addToHistory(o2);
      site3.addToHistory(o3);

      server.addToHistory(server.goto(o2));
      server.addToHistory(server.goto(o3));

      site2.addToHistory(site2.goto(o3));
      site1.addToHistory(site1.goto(o3));

      const o1 = new Insert('x', 1, '3', 1, site1.historyBuffer.map(o => o.id));
      site1.addToHistory(o1);

      server.addToHistory(server.goto(o1));
      site2.addToHistory(site2.goto(o1));
      site3.addToHistory(site3.goto(o1));

      site1.addToHistory(site1.goto(o2));
      site3.addToHistory(site3.goto(o2));

      const result0 = applyOps('', server.historyBuffer);
      const result1 = applyOps('', site1.historyBuffer);
      const result2 = applyOps('', site2.historyBuffer);
      const result3 = applyOps('', site3.historyBuffer);

      expect(result0).toEqual(result1);
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });
});
