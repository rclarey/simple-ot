export { IOperation, OT } from './control';
import { Delete, Insert, Operation, OperationType, deserialize, exclusionTransform, inclusionTransform, serialize } from './charwise';
export declare const charwise: {
    Delete: typeof Delete;
    Insert: typeof Insert;
    Operation: typeof Operation;
    OperationType: typeof OperationType;
    deserialize: typeof deserialize;
    exclusionTransform: typeof exclusionTransform;
    inclusionTransform: typeof inclusionTransform;
    serialize: typeof serialize;
};
