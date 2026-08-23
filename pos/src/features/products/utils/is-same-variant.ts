import { HasVariantOptions } from "../addProduct.types";

export const isSameVariant = (a: HasVariantOptions, b: HasVariantOptions) => {
  const aOptions = a.options;
  const bOptions = b.options;

  if (!aOptions || !bOptions) {
    return false;
  }

  if (aOptions.length !== bOptions.length) {
    return false;
  }

  return aOptions.every((optionA) =>
    bOptions.some(
      (optionB) =>
        optionA.typeId === optionB.typeId &&
        optionA.optionId === optionB.optionId,
    ),
  );
};
