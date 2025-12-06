export interface InwardProps {
  formData: ProductType;
  setFormData: React.Dispatch<React.SetStateAction<ProductType>>;
  setFormErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  formErrors?: Record<string, string>;
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
  unit_weight: number | string;
  density: number | string;
  quantity: number | string;
  total_weight: number | string;
  stock_due: number | string;
  remarks: string;

  programer_status?: string;
  qa_status?: string;
  acc_status?: string;


  programer_details?: ProgramerDetails[];
  qa_details?: QaDetails[];
  account_details?: AccountDetails[];
}

export interface Company {
  id: number;
  company_name: string;
  customer_name: string;
  company_address: string;
  contact_no: string;
  company_email: string;
  customer_dc_no: string;
}



export interface ProgramerDetails {
  id: number;
  program_no: string;
  program_date: string;
  processed_width: number;
  processed_length: number;
  created_by__username: string;   // <-- THIS IS CORRECT
  // include all backend keys: processed_quantity, pierce_per_sheet, etc.
}

export interface QaDetails {
  id: number;
  processed_date: string;
  shift: string;
  no_of_sheets: number;
  cycletime_per_sheet: string;
  total_cycle_time: string;
  operator_name: string;
  machines_used: string;  // <-- NOT machine_used
  created_by__username: string;
}

export interface AccountDetails {
  id: number;
  invoice_no: number;
  status: string;
  remarks: string;
  created_by__username: string;

  product_details?: number
}
