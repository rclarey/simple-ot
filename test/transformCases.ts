import { Arbiter, OperationType, Insert, Delete } from '../src/types';

const insertAuxPos2 = new Insert('a', 1, 0, []);
const insertAuxPos0 = new Insert('a', 1, 0, []);
const deleteAuxPos = new Delete(1, 0, []);
insertAuxPos2.auxPos = 2;
insertAuxPos0.auxPos = 0;
deleteAuxPos.auxPos = 2;

export const itCases = [
  {
    name: 'I<I',
    side: Arbiter.LEFT,
    op1: new Insert('a', 1, 0, []),
    op2: new Insert('b', 2, 0, []),
    op3: new Insert('a', 1, 0, []),
  },
  {
    name: 'I=I(LEFT)',
    side: Arbiter.LEFT,
    op1: new Insert('a', 1, 0, []),
    op2: new Insert('b', 1, 0, []),
    op3: new Insert('a', 1, 0, []),
  },
  {
    name: 'I=I(RIGHT)',
    side: Arbiter.RIGHT,
    op1: new Insert('a', 1, 0, []),
    op2: new Insert('b', 1, 0, []),
    op3: new Insert('a', 2, 0, []),
  },
  {
    name: 'I>I',
    side: Arbiter.LEFT,
    op1: new Insert('a', 2, 0, []),
    op2: new Insert('b', 1, 0, []),
    op3: new Insert('a', 3, 0, []),
  },

  {
    name: 'I<D',
    side: Arbiter.LEFT,
    op1: new Insert('a', 1, 0, []),
    op2: new Delete(2, 0, []),
    op3: new Insert('a', 1, 0, []),
  },
  {
    name: 'I=D(NOOP)',
    side: Arbiter.LEFT,
    op1: new Insert('a', 1, 0, []),
    op2: new Delete(1, 0, [], true),
    op3: new Insert('a', 1, 0, [], true),
  },
  {
    name: 'I=D(YESOP)',
    side: Arbiter.LEFT,
    op1: new Insert('a', 1, 0, []),
    op2: new Delete(1, 0, []),
    op3: new Insert('a', 1, 0, []),
  },
  {
    name: 'I>D',
    side: Arbiter.LEFT,
    op1: new Insert('a', 2, 0, []),
    op2: new Delete(1, 0, []),
    op3: insertAuxPos2,
  },

  {
    name: 'D<I',
    side: Arbiter.LEFT,
    op1: new Delete(1, 0, []),
    op2: new Insert('a', 2, 0, []),
    op3: new Delete(1, 0, []),
  },
  {
    name: 'D=I',
    side: Arbiter.LEFT,
    op1: new Delete(1, 0, []),
    op2: new Insert('a', 1, 0, []),
    op3: new Delete(2, 0, []),
  },
  {
    name: 'D>I',
    side: Arbiter.LEFT,
    op1: new Delete(2, 0, []),
    op2: new Insert('a', 1, 0, []),
    op3: new Delete(3, 0, []),
  },

  {
    name: 'D<D',
    side: Arbiter.LEFT,
    op1: new Delete(1, 0, []),
    op2: new Delete(2, 0, []),
    op3: new Delete(1, 0, []),
  },
  {
    name: 'D=D',
    side: Arbiter.RIGHT,
    op1: new Delete(1, 0, []),
    op2: new Delete(1, 0, []),
    op3: new Delete(1, 0, [], true),
  },
  {
    name: 'D>D',
    side: Arbiter.LEFT,
    op1: new Delete(2, 0, []),
    op2: new Delete(1, 0, []),
    op3: deleteAuxPos,
  },

  {
    name: 'Bad input 1',
    side: Arbiter.LEFT,
    op1: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
    op2: new Delete(1, 0, []),
    op3: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
  },
  {
    name: 'Bad input 2',
    side: Arbiter.LEFT,
    op1: new Delete(1, 0, []),
    op2: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
    op3: new Delete(1, 0, []),
  },
  {
    name: 'Bad input 3',
    side: Arbiter.LEFT,
    op1: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
    op2: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
    op3: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
  },
];

export const etCases = [
  {
    name: 'I<I',
    side: Arbiter.LEFT,
    op1: new Insert('a', 1, 0, []),
    op2: new Insert('b', 2, 0, []),
    op3: new Insert('a', 1, 0, []),
  },
  {
    name: 'I=I(LEFT)',
    side: Arbiter.LEFT,
    op1: new Insert('a', 1, 0, []),
    op2: new Insert('b', 1, 0, []),
    op3: new Insert('a', 1, 0, []),
  },
  {
    name: 'I=I(RIGHT)',
    side: Arbiter.RIGHT,
    op1: new Insert('a', 1, 0, []),
    op2: new Insert('b', 1, 0, []),
    op3: insertAuxPos0,
  },
  {
    name: 'I>I(LEFT)',
    side: Arbiter.LEFT,
    op1: new Insert('a', 2, 0, []),
    op2: new Insert('b', 1, 0, []),
    op3: insertAuxPos2,
  },
  {
    name: 'I>I(RIGHT)',
    side: Arbiter.RIGHT,
    op1: new Insert('a', 2, 0, []),
    op2: new Insert('b', 1, 0, []),
    op3: new Insert('a', 1, 0, []),
  },

  {
    name: 'I<D',
    side: Arbiter.LEFT,
    op1: new Insert('a', 1, 0, []),
    op2: new Delete(2, 0, []),
    op3: new Insert('a', 1, 0, []),
  },
  {
    name: 'I=D(NOOP)',
    side: Arbiter.LEFT,
    op1: new Insert('a', 1, 0, [], true),
    op2: new Delete(1, 0, [], true),
    op3: new Insert('a', 1, 0, []),
  },
  {
    name: 'I=D(OGPOS)',
    side: Arbiter.LEFT,
    op1: insertAuxPos2,
    op2: new Delete(1, 0, []),
    op3: new Insert('a', 2, 0, []),
  },
  {
    name: 'I=D(VANILLA)',
    side: Arbiter.LEFT,
    op1: new Insert('a', 1, 0, []),
    op2: new Delete(1, 0, []),
    op3: new Insert('a', 1, 0, []),
  },
  {
    name: 'I>D',
    side: Arbiter.LEFT,
    op1: new Insert('a', 2, 0, []),
    op2: new Delete(1, 0, []),
    op3: new Insert('a', 3, 0, []),
  },

  {
    name: 'D<I',
    side: Arbiter.LEFT,
    op1: new Delete(1, 0, []),
    op2: new Insert('a', 2, 0, []),
    op3: new Delete(1, 0, []),
  },
  {
    name: 'D=I',
    side: Arbiter.LEFT,
    op1: new Delete(1, 0, []),
    op2: new Insert('a', 1, 0, []),
    op3: new Delete(1, 0, [], true),
  },
  {
    name: 'D>I',
    side: Arbiter.LEFT,
    op1: new Delete(2, 0, []),
    op2: new Insert('a', 1, 0, []),
    op3: new Delete(1, 0, []),
  },

  {
    name: 'D<D',
    side: Arbiter.LEFT,
    op1: new Delete(1, 0, []),
    op2: new Delete(2, 0, []),
    op3: new Delete(1, 0, []),
  },
  {
    name: 'D=D(NOOP)',
    side: Arbiter.LEFT,
    op1: new Delete(1, 0, [], true),
    op2: new Delete(1, 0, []),
    op3: new Delete(1, 0, []),
  },
  {
    name: 'D=D(YESOP)',
    side: Arbiter.LEFT,
    op1: new Delete(1, 0, []),
    op2: new Delete(1, 0, []),
    op3: new Delete(2, 0, []),
  },
  {
    name: 'D>D',
    side: Arbiter.LEFT,
    op1: new Delete(2, 0, []),
    op2: new Delete(1, 0, []),
    op3: new Delete(3, 0, []),
  },

  {
    name: 'Bad input 1',
    side: Arbiter.LEFT,
    op1: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
    op2: new Delete(1, 0, []),
    op3: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
  },
  {
    name: 'Bad input 2',
    side: Arbiter.LEFT,
    op1: new Delete(1, 0, []),
    op2: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
    op3: new Delete(1, 0, []),
  },
  {
    name: 'Bad input 3',
    side: Arbiter.LEFT,
    op1: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
    op2: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
    op3: { p: 1, ts: 0, t: OperationType.INSERT, hb: [], auxPos: 0, isNoop: false },
  },
];
