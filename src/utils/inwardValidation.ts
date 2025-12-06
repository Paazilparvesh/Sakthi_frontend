import { Material, ProductType } from "@/types/inward.type";

export const validateField = (
  field: keyof ProductType,
  value: string | number | Material[]
): string => {
  const strValue = value?.toString?.() ?? ""; // safely convert

  switch (field) {
    case "company_name":
    case "customer_name":
      if (!strValue.trim()) return "This field is required.";
      break;

    case "color":
      if (!strValue) return "Please select a color.";
      if (strValue !== "yellow" && strValue !== "White")
        return "Invalid color selection.";
      break;

    case "serial_number":
    case "inward_slip_number":
    case "customer_dc_no":
      if (!strValue) return "This field is required.";
      if (!/^\d+$/.test(strValue)) return "Only digits allowed.";
      break;

    case "contact_no":
      if (!strValue) return "This field is required.";
      if (!/^\d+$/.test(strValue)) return "Only digits allowed.";
      if (strValue.length < 10)
        return "Mobile number must be at least 10 digits.";
      break;

    case "date":
      if (!strValue) return "This field is required.";
      if (isNaN(Date.parse(strValue))) return "Invalid date.";
      break;

    default:
      return "";
  }

  return "";
};

export const validateAllFields = (formData: ProductType) => {
  const errors: Record<string, string> = {};

  const fields: (keyof ProductType)[] = [
    "serial_number",
    "inward_slip_number",
    "company_name",
    "customer_name",
    "customer_dc_no",
    "worker_no",
    "contact_no",
    "date",
    "color",
  ];

  fields.forEach((field) => {
    const err = validateField(field, formData[field]);
    if (err) errors[field] = err;
  });

  return errors;
};
