import { GeneratedVariant, VariantOptionGroup } from "../addProduct.types";

  export function generateVariants(
    variantOptions: VariantOptionGroup[],
  ): GeneratedVariant[] {
    if (variantOptions.length === 0) {
      return [];
    }
    return variantOptions.reduce<GeneratedVariant[]>(
      (combinations, group) => {
        return combinations.flatMap((combination) =>
          group.options.map((option) => ({
            options: [
              ...combination.options,
              {
                typeId: group.typeId,
                typeName: group.typeName,
                optionId: option.optionId,
                value: option.value,
              },
            ],
          })),
        );
      },
      [{ options: [] }],
    );
  }