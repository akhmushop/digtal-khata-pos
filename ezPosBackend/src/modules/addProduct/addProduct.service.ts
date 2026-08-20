import { brands } from "../../db/schema/brands.js";
import { categories } from "../../db/schema/categories.js";
import { db } from "../../db/schema/index.js";
import { suppliers } from "../../db/schema/suppliers.js";
import { units } from "../../db/schema/units.js";

async function getBrands() {
  return db
    .select({
      value: brands.id,
      label: brands.name,
    })
    .from(brands);
}
async function getUnits() {
  return db
    .select({
      value: units.id,
      label: units.name,
    })
    .from(units);
}
async function getCategories() {
  return db
    .select({
      value: categories.id,
      label: categories.name,
    })
    .from(categories);
}
async function getSuppliers() {
  return db
    .select({
      value: suppliers.id,
      label: suppliers.name,
    })
    .from(suppliers);
}
export async function getAddProductsSelectOptions() {
  const [allBrands, allUnits, allCategories, allSuppliers] = await Promise.all([
    getBrands(),
    getUnits(),
    getCategories(),
    getSuppliers(),
  ]);
  return {
    brands: allBrands,
    units: allUnits,
    categories: allCategories,
    suppliers: allSuppliers,
  };
}
