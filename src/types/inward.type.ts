export interface InwardProps {
  formData: ProductType;
  setFormData: React.Dispatch<React.SetStateAction<ProductType>>;
  setFormErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  formErrors?: Record<string, string>;
}
export interface ProgramerProps {
  data?: ProductType[];
  item?: ProductType;
  currentStep?: number;
  setCurrentStep?: React.Dispatch<React.SetStateAction<number>>;
  onBack?: () => void;
  onSuccess?: () => void;
  onView?: (item: ProductType) => void;
}
export interface OutwardProps {
  product?: ProductType[];
  detailed_product?: ProductType;
  program?: ProgramerDetails[];
  onView?: (item: ProductType) => void;
  getStatusColor?: (status: string) => string;
}
export interface OutwardDetailProps {
  product?: ProductType;
}
export interface OutwardProps {
  products?: ProductType[];  // Array of products
  product?: ProductType[];  // Array of products
  onView?: (product: ProductType) => void;
  getStatusColor?: (status: string) => string;
  detailed_product?: ProductType;
  program?: ProgramerDetails[];
  productId?: number;
  companyName?: string;
  materials?: Material[];
  program_details?: ProgramerDetails[];
  onBack?: () => void;
  onSubmitSuccess?: () => void;
}

export interface Company {
  id?: number;

  company_name: string;
  customer_name: string;
  contact_no: string;
  customer_dc_no: string;

  // Optional backend/meta fields (safe to keep optional)
  created_at?: string;
  updated_at?: string;
}
export interface Operator {
  id: number;
  operator_name: string;
}
export interface Density {
  id?: number;
  material_name: string;
  density_value: number;
}
export interface Machine {
  id: number;
  machine: string;
}

export interface ProductType {
  id?: number;
  product_id?: number;
  serial_number: string;
  date: string;
  inward_slip_number: string;
  color: string;
  worker_no: string;
  company_name: string;
  customer_name: string;
  customer_dc_no: string;
  contact_no: string;

  programer_status?: string;
  outward_status?: string;
  qa_status?: string;
  acc_status?: string;
  created_by?: string;

  materials: Material[];
}

export interface Material {
  id?: number;
  bay: string;
  mat_type: string;
  mat_grade: string;

  thick: number | string;
  width: number | string;
  length: number | string;
  density: number | string;
  unit_weight: number | string;
  quantity: number | string;
  total_weight: number | string;
  stock_due: number | string;
  remarks: string;

  planned_qty?: number;

  programer_status?: string;
  qa_status?: string;
  acc_status?: string;

  programer_details?: ProgramerDetails[];
  qa_details?: QaDetails[];
  account_details?: AccountDetails[];
}

export interface ProgramerDetails {
  id?: number;
  product_id?: number;
  product_details?: number | string;
  material_details?: number | string;
  program_no: string | number;
  program_date: string;
  processed_quantity?: number | string;
  balance_quantity?: number | string;
  processed_width?: number | string;
  processed_length?: number | string;
  used_weight?: number | string;
  number_of_sheets?: number | string;
  cut_length_per_sheet?: number | string;
  pierce_per_sheet?: number | string;
  processed_mins_per_sheet?: number | string;
  total_planned_hours?: number | string;
  total_meters?: number | string;
  total_piercing?: number | string;
  total_used_weight?: number | string;
  total_no_of_sheets?: number | string;
  remarks?: string;
  created_by?: string;
  status?: string;
}

export interface QaDetails {
  id?: number;
  product_id?: number;
  material_id?: number | string;
  material_details?: number | string;
  processed_date?: string;
  shift?: string;
  no_of_sheets?: number | string;
  cycletime_per_sheet?: number | string;
  total_cycle_time?: number;
  total_cycle_time_formatted?: string;
  machines_used?: MachineLog[];
  created_by?: string;
  created_by__username?: string;
}

export interface MachineLog {
  machine: string;
  date: string;
  start: string;
  end: string;
  runtime: string;
  air: string;
  operator: string;
}

export interface AccountDetails {
  id: number;
  product_id: number;
  material_id: number;
  invoice_no: number;
  status: string;
  remarks: string;
  created_by: string;
  created_by__username?: string;

  product_details?: number;
}

export interface EditProps {
  product: ProductType;
  onCancel?: () => void;
  onBack?: () => void;
  updateForm?: (partial: Partial<ProductType>) => void;
}
