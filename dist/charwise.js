export var OperationType;
(function (OperationType) {
    OperationType["DELETE"] = "d";
    OperationType["INSERT"] = "i";
})(OperationType || (OperationType = {}));
export class Operation {
    constructor(type, position, id, siteID, historyBuffer, isNoop) {
        this.type = type;
        this.position = position;
        this.id = id;
        this.siteID = siteID;
        this.historyBuffer = historyBuffer;
        this.isNoop = isNoop;
        this.auxPos = position;
    }
}
export class Insert extends Operation {
    constructor(char, position, id, siteID, historyBuffer, isNoop = false) {
        super(OperationType.INSERT, position, id, siteID, historyBuffer, isNoop);
        this.char = char;
    }
}
export class Delete extends Operation {
    constructor(position, id, siteID, historyBuffer, isNoop = false) {
        super(OperationType.DELETE, position, id, siteID, historyBuffer, isNoop);
    }
}
export function inclusionTransform(op1, op2) {
    if (op1.isNoop) {
        if (op1 instanceof Delete && op2 instanceof Insert && op1.position === op2.position) {
            return new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer);
        }
        return op1;
    }
    if (op2.isNoop) {
        if (op1 instanceof Insert && op2 instanceof Delete && op1.position === op2.auxPos) {
            return new Insert(op1.char, op1.position, op1.id, op1.siteID, op1.historyBuffer, true);
        }
        return op1;
    }
    if (op1 instanceof Insert && op2 instanceof Insert) {
        if (op1.position < op2.position ||
            (op1.position === op2.position && op1.siteID <= op2.siteID)) {
            return new Insert(op1.char, op1.auxPos, op1.id, op1.siteID, op1.historyBuffer);
        }
        const pos = Math.min(op1.position, op1.auxPos) + 1;
        return new Insert(op1.char, pos, op1.id, op1.siteID, op1.historyBuffer);
    }
    if (op1 instanceof Insert && op2 instanceof Delete) {
        if (op1.position <= op2.position) {
            return op1;
        }
        const op3 = new Insert(op1.char, op1.position - 1, op1.id, op1.siteID, op1.historyBuffer);
        op3.auxPos = op1.position;
        return op3;
    }
    if (op1 instanceof Delete && op2 instanceof Insert) {
        if (op1.position < op2.position) {
            return op1;
        }
        return new Delete(op1.position + 1, op1.id, op1.siteID, op1.historyBuffer);
    }
    if (op1 instanceof Delete && op2 instanceof Delete) {
        if (op1.position === op2.position) {
            return new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer, true);
        }
        if (op1.position < op2.position) {
            return op1;
        }
        const op3 = new Delete(op1.position - 1, op1.id, op1.siteID, op1.historyBuffer);
        op3.auxPos = op1.position;
        return op3;
    }
    return op1;
}
export function exclusionTransform(op1, op2) {
    if (op1.isNoop) {
        if (op2.isNoop &&
            op1.position === op2.position &&
            op1 instanceof Insert &&
            op2 instanceof Delete) {
            return new Insert(op1.char, op1.position, op1.id, op1.siteID, op1.historyBuffer);
        }
        if (op1.position === op2.position && op1 instanceof Delete && op2 instanceof Delete) {
            return new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer);
        }
        if (op1 instanceof Delete && op2 instanceof Insert) {
            const op = new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer, true);
            op.auxPos = -1;
            return op;
        }
        return op1;
    }
    if (op2.isNoop) {
        return op1;
    }
    if (op1 instanceof Insert && op2 instanceof Insert) {
        if (op1.position === op2.position && op1.siteID > op2.siteID) {
            const op3 = new Insert(op1.char, op1.position, op1.id, op1.siteID, op1.historyBuffer);
            op3.auxPos = op1.position - 1;
            return op3;
        }
        if (op1.position <= op2.position) {
            op2.auxPos = op2.position + 1;
            return op1;
        }
        const op4 = new Insert(op1.char, op1.position - 1, op1.id, op1.siteID, op1.historyBuffer);
        if (op1.siteID < op2.siteID) {
            op4.auxPos = op1.position;
        }
        return op4;
    }
    if (op1 instanceof Insert && op2 instanceof Delete) {
        if (op1.position === op2.position) {
            return new Insert(op1.char, op1.auxPos, op1.id, op1.siteID, op1.historyBuffer);
        }
        if (op1.position < op2.position) {
            return op1;
        }
        return new Insert(op1.char, op1.position + 1, op1.id, op1.siteID, op1.historyBuffer);
    }
    if (op1 instanceof Delete && op2 instanceof Insert) {
        if (op1.position === op2.position) {
            return new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer, true);
        }
        if (op1.position < op2.position) {
            return op1;
        }
        return new Delete(op1.position - 1, op1.id, op1.siteID, op1.historyBuffer);
    }
    if (op1 instanceof Delete && op2 instanceof Delete) {
        if (op1.position >= op2.position) {
            return new Delete(op1.position + 1, op1.id, op1.siteID, op1.historyBuffer);
        }
        return new Delete(op1.position, op1.id, op1.siteID, op1.historyBuffer);
    }
    return op1;
}
export function serialize(operation) {
    const { historyBuffer, id, type, position, siteID } = operation;
    const serialized = { historyBuffer, id, type, position, siteID };
    if (operation instanceof Insert) {
        serialized.char = operation.char;
    }
    return serialized;
}
export function deserialize(op) {
    if (op.type === OperationType.INSERT) {
        return new Insert(op.char, op.position, op.id, op.siteID, op.historyBuffer);
    }
    return new Delete(op.position, op.id, op.siteID, op.historyBuffer);
}
