import { OperationType, Insert, Delete } from '../src/types';

const insertAuxPos2 = new Insert('a', 1, 0, 0, []);
const insertAuxPos0 = new Insert('a', 1, 0, 1, []);
const deleteAuxPos = new Delete(1, 0, 0, []);
insertAuxPos2.auxPos = 2;
insertAuxPos0.auxPos = 0;
deleteAuxPos.auxPos = 2;

export const itCases = [
  {
    name: 'I<I',
    op1: new Insert('a', 1, 0, 0, []),
    op2: new Insert('b', 2, 0, 1, []),
    op3: new Insert('a', 1, 0, 0, []),
  },
  {
    name: 'I=I(LEFT)',
    op1: new Insert('a', 1, 0, 0, []),
    op2: new Insert('b', 1, 0, 1, []),
    op3: new Insert('a', 1, 0, 0, []),
  },
  {
    name: 'I=I(RIGHT)',
    op1: new Insert('a', 1, 0, 1, []),
    op2: new Insert('b', 1, 0, 0, []),
    op3: new Insert('a', 2, 0, 1, []),
  },
  {
    name: 'I>I',
    op1: new Insert('a', 2, 0, 0, []),
    op2: new Insert('b', 1, 0, 1, []),
    op3: new Insert('a', 3, 0, 0, []),
  },

  {
    name: 'I<D',
    op1: new Insert('a', 1, 0, 0, []),
    op2: new Delete(2, 0, 1, []),
    op3: new Insert('a', 1, 0, 0, []),
  },
  {
    name: 'I=D(NOOP)',
    op1: new Insert('a', 1, 0, 0, []),
    op2: new Delete(1, 0, 1, [], true),
    op3: new Insert('a', 1, 0, 0, [], true),
  },
  {
    name: 'I=D(YESOP)',
    op1: new Insert('a', 1, 0, 0, []),
    op2: new Delete(1, 0, 1, []),
    op3: new Insert('a', 1, 0, 0, []),
  },
  {
    name: 'I>D',
    op1: new Insert('a', 2, 0, 0, []),
    op2: new Delete(1, 0, 1, []),
    op3: insertAuxPos2,
  },

  {
    name: 'D<I',
    op1: new Delete(1, 0, 0, []),
    op2: new Insert('a', 2, 0, 1, []),
    op3: new Delete(1, 0, 0, []),
  },
  {
    name: 'D=I',
    op1: new Delete(1, 0, 0, []),
    op2: new Insert('a', 1, 0, 1, []),
    op3: new Delete(2, 0, 0, []),
  },
  {
    name: 'D>I',
    op1: new Delete(2, 0, 0, []),
    op2: new Insert('a', 1, 0, 1, []),
    op3: new Delete(3, 0, 0, []),
  },

  {
    name: 'D<D',
    op1: new Delete(1, 0, 0, []),
    op2: new Delete(2, 0, 1, []),
    op3: new Delete(1, 0, 0, []),
  },
  {
    name: 'D=D',
    op1: new Delete(1, 0, 1, []),
    op2: new Delete(1, 0, 0, []),
    op3: new Delete(1, 0, 1, [], true),
  },
  {
    name: 'D>D',
    op1: new Delete(2, 0, 0, []),
    op2: new Delete(1, 0, 1, []),
    op3: deleteAuxPos,
  },

  {
    name: 'Bad input 1',
    op1: {
      position: 1,
      id: 0,
      siteID: 0,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
    op2: new Delete(1, 0, 1, []),
    op3: {
      position: 1,
      id: 0,
      siteID: 0,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
  },
  {
    name: 'Bad input 2',
    op1: new Delete(1, 0, 0, []),
    op2: {
      position: 1,
      id: 0,
      siteID: 1,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
    op3: new Delete(1, 0, 0, []),
  },
  {
    name: 'Bad input 3',
    op1: {
      position: 1,
      id: 0,
      siteID: 0,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
    op2: {
      position: 1,
      id: 0,
      siteID: 1,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
    op3: {
      position: 1,
      id: 0,
      siteID: 0,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
  },

  {
    name: 'I(noop), op2 arbitrary',
    op1: new Insert('a', 1, 0, 0, [], true),
    op2: new Insert('b', 1, 1, 1, []),
    op3: new Insert('a', 1, 0, 0, [], true),
  },
  {
    name: 'D(noop)!=I',
    op1: new Delete(0, 0, 0, [], true),
    op2: new Insert('b', 1, 1, 1, []),
    op3: new Delete(0, 0, 0, [], true),
  },
];

export const etCases = [
  {
    name: 'I<I',
    op1: new Insert('a', 1, 0, 0, []),
    op2: new Insert('b', 2, 0, 1, []),
    op3: new Insert('a', 1, 0, 0, []),
  },
  {
    name: 'I=I(LEFT)',
    op1: new Insert('a', 1, 0, 0, []),
    op2: new Insert('b', 1, 0, 1, []),
    op3: new Insert('a', 1, 0, 0, []),
  },
  {
    name: 'I=I(RIGHT)',
    op1: new Insert('a', 1, 0, 1, []),
    op2: new Insert('b', 1, 0, 0, []),
    op3: insertAuxPos0,
  },
  {
    name: 'I>I(LEFT)',
    op1: new Insert('a', 2, 0, 0, []),
    op2: new Insert('b', 1, 0, 1, []),
    op3: insertAuxPos2,
  },
  {
    name: 'I>I(RIGHT)',
    op1: new Insert('a', 2, 0, 1, []),
    op2: new Insert('b', 1, 0, 0, []),
    op3: new Insert('a', 1, 0, 1, []),
  },

  {
    name: 'I<D',
    op1: new Insert('a', 1, 0, 0, []),
    op2: new Delete(2, 0, 1, []),
    op3: new Insert('a', 1, 0, 0, []),
  },
  {
    name: 'I=D(NOOP)',
    op1: new Insert('a', 1, 0, 0, [], true),
    op2: new Delete(1, 0, 1, [], true),
    op3: new Insert('a', 1, 0, 0, []),
  },
  {
    name: 'I=D(OGPOS)',
    op1: insertAuxPos2,
    op2: new Delete(1, 0, 1, []),
    op3: new Insert('a', 2, 0, 0, []),
  },
  {
    name: 'I=D(VANILLA)',
    op1: new Insert('a', 1, 0, 0, []),
    op2: new Delete(1, 0, 1, []),
    op3: new Insert('a', 1, 0, 0, []),
  },
  {
    name: 'I>D',
    op1: new Insert('a', 2, 0, 0, []),
    op2: new Delete(1, 0, 1, []),
    op3: new Insert('a', 3, 0, 0, []),
  },

  {
    name: 'D<I',
    op1: new Delete(1, 0, 0, []),
    op2: new Insert('a', 2, 0, 1, []),
    op3: new Delete(1, 0, 0, []),
  },
  {
    name: 'D=I',
    op1: new Delete(1, 0, 0, []),
    op2: new Insert('a', 1, 0, 1, []),
    op3: new Delete(1, 0, 0, [], true),
  },
  {
    name: 'D>I',
    op1: new Delete(2, 0, 0, []),
    op2: new Insert('a', 1, 0, 1, []),
    op3: new Delete(1, 0, 0, []),
  },

  {
    name: 'D<D',
    op1: new Delete(1, 0, 0, []),
    op2: new Delete(2, 0, 1, []),
    op3: new Delete(1, 0, 0, []),
  },
  {
    name: 'D=D(NOOP)',
    op1: new Delete(1, 0, 0, [], true),
    op2: new Delete(1, 0, 1, []),
    op3: new Delete(1, 0, 1, []),
  },
  {
    name: 'D=D(YESOP)',
    op1: new Delete(1, 0, 0, []),
    op2: new Delete(1, 0, 1, []),
    op3: new Delete(2, 0, 0, []),
  },
  {
    name: 'D>D',
    op1: new Delete(2, 0, 0, []),
    op2: new Delete(1, 0, 1, []),
    op3: new Delete(3, 0, 0, []),
  },

  {
    name: 'Bad input 1',
    op1: {
      position: 1,
      id: 0,
      siteID: 0,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
    op2: new Delete(1, 0, 1, []),
    op3: {
      position: 1,
      id: 0,
      siteID: 0,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
  },
  {
    name: 'Bad input 2',
    op1: new Delete(1, 0, 0, []),
    op2: {
      position: 1,
      id: 0,
      siteID: 1,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
    op3: new Delete(1, 0, 0, []),
  },
  {
    name: 'Bad input 3',
    op1: {
      position: 1,
      id: 0,
      siteID: 0,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
    op2: {
      position: 1,
      id: 0,
      siteID: 1,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
    op3: {
      position: 1,
      id: 0,
      siteID: 0,
      type: OperationType.INSERT,
      historyBuffer: [],
      auxPos: 0,
      isNoop: false,
    },
  },

  {
    name: 'yesop, noop 1',
    op1: new Insert('w', 3, 0, 0, []),
    op2: new Delete(0, 0, 1, [], true),
    op3: new Insert('w', 3, 0, 0, []),
  },
  {
    name: 'yesop, noop 2',
    op1: new Delete(3, 0, 0, []),
    op2: new Insert('a', 3, 0, 1, [], true),
    op3: new Delete(3, 0, 0, []),
  },
  {
    name: 'yesop, noop 3',
    op1: new Delete(3, 0, 0, []),
    op2: new Insert('a', 5, 0, 1, [], true),
    op3: new Delete(3, 0, 0, []),
  },
];
