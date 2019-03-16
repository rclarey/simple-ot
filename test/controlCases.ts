import { Insert, Delete } from '../src/charwise';

export const transposeCases = [
  {
    name: 'I<I',
    op1: new Insert('a', 1, 0, 0, []),
    op1Prime: new Insert('a', 1, 0, 0, []),
    op2: new Insert('b', 2, 0, 0, []),
    op2Prime: new Insert('b', 1, 0, 0, []),
  },
  {
    name: 'I=I',
    op1: new Insert('a', 1, 0, 0, []),
    op1Prime: new Insert('a', 2, 0, 0, []),
    op2: new Insert('b', 1, 0, 0, []),
    op2Prime: new Insert('b', 1, 0, 0, []),
  },
  {
    name: 'I>I',
    op1: new Insert('a', 2, 0, 0, []),
    op1Prime: new Insert('a', 3, 0, 0, []),
    op2: new Insert('b', 1, 0, 0, []),
    op2Prime: new Insert('b', 1, 0, 0, []),
  },

  {
    name: 'I<D',
    op1: new Insert('a', 1, 0, 0, []),
    op1Prime: new Insert('a', 1, 0, 0, []),
    op2: new Delete(2, 0, 0, []),
    op2Prime: new Delete(1, 0, 0, []),
  },
  {
    name: 'I=D',
    op1: new Insert('a', 1, 0, 0, []),
    op1Prime: new Insert('a', 1, 0, 0, [], true),
    op2: new Delete(1, 0, 0, []),
    op2Prime: new Delete(1, 0, 0, [], true),
  },
  {
    name: 'I>D',
    op1: new Insert('a', 2, 0, 0, []),
    op1Prime: new Insert('a', 1, 0, 0, []),
    op2: new Delete(1, 0, 0, []),
    op2Prime: new Delete(1, 0, 0, []),
  },

  {
    name: 'D<I',
    op1: new Delete(1, 0, 0, []),
    op1Prime: new Delete(1, 0, 0, []),
    op2: new Insert('a', 2, 0, 0, []),
    op2Prime: new Insert('a', 3, 0, 0, []),
  },
  {
    name: 'D=I',
    op1: new Delete(1, 0, 0, []),
    op1Prime: new Delete(2, 0, 0, []),
    op2: new Insert('a', 1, 0, 0, []),
    op2Prime: new Insert('a', 1, 0, 0, []),
  },
  {
    name: 'D>I',
    op1: new Delete(2, 0, 0, []),
    op1Prime: new Delete(3, 0, 0, []),
    op2: new Insert('a', 1, 0, 0, []),
    op2Prime: new Insert('a', 1, 0, 0, []),
  },

  {
    name: 'D<D',
    op1: new Delete(1, 0, 0, []),
    op1Prime: new Delete(1, 0, 0, []),
    op2: new Delete(2, 0, 0, []),
    op2Prime: new Delete(3, 0, 0, []),
  },
  {
    name: 'D=D',
    op1: new Delete(1, 0, 0, []),
    op1Prime: new Delete(1, 0, 0, []),
    op2: new Delete(1, 0, 0, []),
    op2Prime: new Delete(2, 0, 0, []),
  },
  {
    name: 'D>D',
    op1: new Delete(2, 0, 0, []),
    op1Prime: new Delete(1, 0, 0, []),
    op2: new Delete(1, 0, 0, []),
    op2Prime: new Delete(1, 0, 0, []),
  },
];

export const listTransposeCases = [
  {
    end: 3,
    hb: [
      new Delete(0, 0, 0, []),
      new Insert('d', 3, 1, 0, []),
      new Insert('a', 1, 2, 0, []),
      new Delete(1, 3, 0, []),
    ],
    name: 'Double (D&I) noop',
    out: 'xyzd',
    start: 0,
    str: 'wxyz',
  },
  {
    end: 3,
    hb: [
      new Insert('i', 1, 0, 0, []),
      new Insert('i', 1, 1, 0, []),
      new Delete(5, 2, 0, []),
      new Delete(1, 3, 0, []),
    ],
    name: 'Two identical I then D one of those I',
    out: 'figlhs',
    start: 0,
    str: 'fglths',
  },
  {
    end: 5,
    hb: [
      new Insert('y', 1, 0, 0, []),
      new Delete(0, 1, 0, []),
      new Delete(1, 2, 0, []),
      new Insert('o', 0, 3, 0, []),
      new Delete(1, 4, 0, []),
      new Insert('v', 1, 5, 0, []),
    ],
    name: 'I<I(LEFT) practical',
    out: 'ovys',
    start: 0,
    str: 'axys',
  },
];
