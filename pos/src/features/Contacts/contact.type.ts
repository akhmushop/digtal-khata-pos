import { SupplierSchemaTypeOutput } from "./schemas/supplier.schema";
export type CreateSupplerResponse = {
  success: boolean;
  message: string;
  data: {
    supplierId: number;
  };
};
export interface ContactStoreType {
  createSupplier: (
    data: SupplierSchemaTypeOutput,
  ) => Promise<CreateSupplerResponse>;
}
