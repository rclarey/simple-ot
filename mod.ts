export { IOperation, OT } from "./control.ts";
import {
  Delete,
  Insert,
  Operation,
  OperationType,
  deserialize,
  exclusionTransform,
  inclusionTransform,
  serialize,
} from "./charwise.ts";

export const charwise = {
  Delete,
  Insert,
  Operation,
  OperationType,
  deserialize,
  exclusionTransform,
  inclusionTransform,
  serialize,
};
