// src/types.ts
export interface FullProduct {
  id: number;
    product_id?: number;
    Company_name: string;
    serial_number: string;
    date?: string;
    Customer_name?: string;
    Customer_No?: string;
    Customer_date?: string;
    mobile?: string;
    status: string;
    full: FullProduct,
}

export interface Product {
    id: number;
    product_id?: number;
    Company_name: string;
    serial_number: string;
    date?: string;
    Customer_name?: string;
    Customer_No?: string;
    Customer_date?: string;
    mobile?: string;
    status: string;
    full: FullProduct,
}

export interface QAItem {
    product_id: number;
    program_no: string;
    lm_co1: string;
    lm_co2: string;
    lm_co3: string;
    fm_co1: string;
    fm_co2: string;
    fm_co3: string;
    status: string;
}

export interface ApiResponse {
  msg: string;
  product: FullProduct[];
  qa_details: QAItem[];
}
