import { Insert, Delete } from '../src/types';

export const transposeCases = [
  {
    name: 'I<I',
    op1: new Insert('a', 1, 0, []),
    op2: new Insert('b', 2, 0, []),
    op1Prime: new Insert('a', 1, 0, []),
    op2Prime: new Insert('b', 1, 0, []),
  },
  {
    name: 'I=I',
    op1: new Insert('a', 1, 0, []),
    op2: new Insert('b', 1, 0, []),
    op1Prime: new Insert('a', 2, 0, []),
    op2Prime: new Insert('b', 1, 0, []),
  },
  {
    name: 'I>I',
    op1: new Insert('a', 2, 0, []),
    op2: new Insert('b', 1, 0, []),
    op1Prime: new Insert('a', 3, 0, []),
    op2Prime: new Insert('b', 1, 0, []),
  },

  {
    name: 'I<D',
    op1: new Insert('a', 1, 0, []),
    op2: new Delete(2, 0, []),
    op1Prime: new Insert('a', 1, 0, []),
    op2Prime: new Delete(1, 0, []),
  },
  {
    name: 'I=D',
    op1: new Insert('a', 1, 0, []),
    op2: new Delete(1, 0, []),
    op1Prime: new Insert('a', 1, 0, [], true),
    op2Prime: new Delete(1, 0, [], true),
  },
  {
    name: 'I>D',
    op1: new Insert('a', 2, 0, []),
    op2: new Delete(1, 0, []),
    op1Prime: new Insert('a', 1, 0, []),
    op2Prime: new Delete(1, 0, []),
  },

  {
    name: 'D<I',
    op1: new Delete(1, 0, []),
    op2: new Insert('a', 2, 0, []),
    op1Prime: new Delete(1, 0, []),
    op2Prime: new Insert('a', 3, 0, []),
  },
  {
    name: 'D=I',
    op1: new Delete(1, 0, []),
    op2: new Insert('a', 1, 0, []),
    op1Prime: new Delete(2, 0, []),
    op2Prime: new Insert('a', 1, 0, []),
  },
  {
    name: 'D>I',
    op1: new Delete(2, 0, []),
    op2: new Insert('a', 1, 0, []),
    op1Prime: new Delete(3, 0, []),
    op2Prime: new Insert('a', 1, 0, []),
  },

  {
    name: 'D<D',
    op1: new Delete(1, 0, []),
    op2: new Delete(2, 0, []),
    op1Prime: new Delete(1, 0, []),
    op2Prime: new Delete(3, 0, []),
  },
  {
    name: 'D=D',
    op1: new Delete(1, 0, []),
    op2: new Delete(1, 0, []),
    op1Prime: new Delete(1, 0, []),
    op2Prime: new Delete(2, 0, []),
  },
  {
    name: 'D>D',
    op1: new Delete(2, 0, []),
    op2: new Delete(1, 0, []),
    op1Prime: new Delete(1, 0, []),
    op2Prime: new Delete(1, 0, []),
  },
];

export const listTransposeCases = [
  {
    name: 'Double (D&I) noop',
    hb: [
      new Delete(0, 0, []),
      new Insert('d', 3, 1, []),
      new Insert('a', 1, 2, []),
      new Delete(1, 3, []),
    ],
    start: 0,
    end: 3,
    str: 'wxyz',
    out: 'xyzd',
  },
  {
    name: 'Two identical I then D one of those I',
    hb: [
      new Insert('i', 1, 0, []),
      new Insert('i', 1, 1, []),
      new Delete(5, 2, []),
      new Delete(1, 3, []),
    ],
    start: 0,
    end: 3,
    str: 'fglths',
    out: 'figlhs',
  },
  {
    name: 'I<I(LEFT) practical case',
    hb: [
      new Insert('y', 1, 0, []),
      new Delete(0, 1, []),
      new Delete(1, 2, []),
      new Insert('o', 0, 3, []),
      new Delete(1, 4, []),
      new Insert('v', 1, 5, []),
    ],
    start: 0,
    end: 5,
    str: 'oxys',
    out: 'ovys',
  },
];
