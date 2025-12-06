export interface ScheduleProcess {
    product_id: number;
    schedule_name: number;
    process_date: string;
    cycle_time: string;
    operator_name: string;
    remark: string;
    processName: string;
}
// interface ScheduleProcess {
//   schedule_name: number;
//   process_date: string;
//   cycle_time: string;
//   operator_name: string;
//   remark: string;
// }


export interface Product {
  product_id: number;
  Company_name: string;
  serial_number: string;
  date: string;
  Customer_name: string;
  Customer_No: string;
  Customer_date: string;
  mobile: string;
  status: string;
}

export interface QA {
  product_id: number;
  program_no: string;
  lm_co1: boolean;
  lm_co2: boolean;
  lm_co3: boolean;
  fm_co1: boolean;
  fm_co2: boolean;
  fm_co3: boolean;
  status: string;
}

export interface Schedule {
  product_id: number;
  commitment_Date: string;
  planning_date: string;
  date_of_delivery: string;
  date_of_inspection: string;
}
