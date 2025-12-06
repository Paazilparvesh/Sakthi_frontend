import { Material } from "@/types/inward.type";

export interface MaterialError {
  [index: number]: {
    [field: string]: string;
  };
}

export const validateMaterialRow = (mat: Material) => {
  const errors: Record<string, string> = {};

  // Required numeric fields
  const numericFields = ["thick", "width", "length", "quantity", "density"];

  numericFields.forEach((field) => {
    const val = mat[field as keyof Material]?.toString() ?? "";
    if (!val) errors[field] = "";
    else if (isNaN(Number(val))) errors[field] = "";
  });

  // Weight fields
  if (!mat.unit_weight) errors.unit_weight = "";
  if (!mat.total_weight) errors.total_weight = "";

  return errors;
};

export const validateAllMaterials = (materials: Material[]) => {
  const allErrors: MaterialError = {};

  materials.forEach((mat, index) => {
    const rowErrors = validateMaterialRow(mat);
    if (Object.keys(rowErrors).length > 0) {
      allErrors[index] = rowErrors;
    }
  });

  return allErrors;
};
