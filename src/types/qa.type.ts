import { ProductType } from "@/types/inward.type";

export interface ProgramerTableProps {
    data: ProductType[];
    onView: (item: ProductType) => void;
}
export interface ProgramerDetailProps {
  item: ProductType;
}



export interface QAData {
  product_id: number;
  product_details?: number;
  material_details?: number;
  status?: string;
}



export interface ProgramFormData {
  programNo: string;
  selectedAllotments: string[];
}
// --- Types ---
export interface ProductId {
  id: number;
  serial_number: string;
}
export interface QaFormWrapperProps {
  item: ProductId;
  onBack?: () => void;
  onSuccess?: () => void;
}
export interface ProductItem {
  id: number;
  serial_number: string;
}
export interface QaForm1Props {
  item: ProductItem;
  formData: ProgramFormData;
  onChange: (data: Partial<ProgramFormData>) => void;
  onBack?: () => void;
}

export interface QaForm2Props {
  product: { id: number; serial_number: string };
  onChange: (data: Partial<ProgramFormData>) => void;
  onBack?: () => void;
  onSuccess?: () => void;
}


