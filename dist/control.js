export class OT {
    constructor(inclusionTransform, exclusionTransform, siteID) {
        this.inclusionTransform = inclusionTransform;
        this.exclusionTransform = exclusionTransform;
        this.siteID = siteID;
        this.historyBuffer = [];
        this.idHistory = [];
    }
    static operationsAreIndependent(op1, op2) {
        for (const id of op1.historyBuffer) {
            if (id === op2.id) {
                return false;
            }
        }
        return true;
    }
    addToHistory(op) {
        this.historyBuffer.push(op);
        this.idHistory.push(op.id);
    }
    history() {
        return this.idHistory;
    }
    transpose(op1, op2) {
        const op2Prime = this.exclusionTransform(op2, op1);
        const op1Prime = this.inclusionTransform(op1, op2Prime);
        return [op2Prime, op1Prime];
    }
    listTranspose(start, end) {
        const hb = this.historyBuffer;
        for (let i = end; i > start; i -= 1) {
            const result = this.transpose(hb[i - 1], hb[i]);
            [hb[i - 1], hb[i]] = result;
        }
    }
    listInclusionTransform(operation, start) {
        let transformed = operation;
        for (let i = start; i < this.historyBuffer.length; i += 1) {
            const op2 = this.historyBuffer[i];
            transformed = this.inclusionTransform(transformed, op2);
        }
        return transformed;
    }
    goto(operation) {
        let k = -1;
        for (let i = 0; i < this.historyBuffer.length; i += 1) {
            if (OT.operationsAreIndependent(operation, this.historyBuffer[i])) {
                k = i;
                break;
            }
        }
        if (k === -1) {
            return operation;
        }
        const pre = [];
        for (let i = k + 1; i < this.historyBuffer.length; i += 1) {
            if (!OT.operationsAreIndependent(operation, this.historyBuffer[i])) {
                pre.push(i);
            }
        }
        if (pre.length === 0) {
            return this.listInclusionTransform(operation, k);
        }
        const r = pre.length;
        for (let i = 0; i < r; i += 1) {
            this.listTranspose(k + i, pre[i]);
        }
        return this.listInclusionTransform(operation, k + r);
    }
}
