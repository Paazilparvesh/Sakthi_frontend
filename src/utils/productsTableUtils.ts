import {
  ProductType,
  Material,
  ProgramerDetails,
  QaDetails,
  QaMachineLog,
  AccountDetails,
} from "@/types/inward.type";

export type FlattenedRow = {
  material_id: number;
  [key: string]: unknown;
};

export type ColumnFilters = Record<string, string>;

/* ---------------------------------------------------------
   SAFE FORMAT MINUTES → HH:MM
--------------------------------------------------------- */
export const formatMinutesToTime = (minutes: number | string): string => {
  if (!minutes && minutes !== 0) return "00:00";

  const value = Number(minutes);
  if (isNaN(value) || value < 0) return "00:00";

  const hrs = Math.floor(value / 60);
  const mins = Math.floor(value % 60);

  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/* ---------------------------------------------------------
   PARSE HH:MM → MINUTES (with full validation)
--------------------------------------------------------- */
export const parseTimeToMinutes = (
  value: string | number | null | undefined
): number => {
  if (!value) return 0;

  if (typeof value === "string" && value.includes(":")) {
    const [h, m] = value.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
  }

  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/* ---------------------------------------------------------
   FLATTEN API INTO EXCEL-LIKE TABLE STRUCTURE
--------------------------------------------------------- */
export const flattenRows = (products: ProductType[] = []): FlattenedRow[] => {
  const rows: FlattenedRow[] = [];

  if (products.length === 0) return [];

  products.forEach((p) => {
    if (!p.materials || p.materials.length === 0) {
      return rows.push({
        ...p,
        material_id: -1,
        mat_type: "",
        thick: "",
        width: "",
        length: "",
      });
    }

    p.materials.forEach((m: Material) => {
      const prog: ProgramerDetails | undefined = m.programer_details?.[0];
      const qa: QaDetails | undefined = m.qa_details?.[0];
      const acc: AccountDetails | undefined = m.account_details?.[0];

      const machineLogs: QaMachineLog[] = qa?.machines_used || [];

      /** CASE 1: Machine logs exist → create one row per log */
      if (machineLogs.length > 0) {
        machineLogs.forEach((log) => {
          rows.push({
            ...p,
            material_id: m.id,

            ...m,

            // Program (safe defaults)
            program_no: prog?.program_no ?? "",
            program_date: prog?.program_date ?? "",
            processed_quantity: prog?.processed_quantity ?? "",
            balance_quantity: prog?.balance_quantity ?? "",
            processed_width: prog?.processed_width ?? "",
            processed_length: prog?.processed_length ?? "",
            used_weight: prog?.used_weight ?? "",
            number_of_sheets: prog?.number_of_sheets ?? "",
            cut_length_per_sheet: prog?.cut_length_per_sheet ?? "",
            pierce_per_sheet: prog?.pierce_per_sheet ?? "",
            processed_mins_per_sheet: prog?.processed_mins_per_sheet ?? "",
            total_planned_hours: prog?.total_planned_hours ?? "",
            total_meters: prog?.total_meters ?? "",
            total_piercing: prog?.total_piercing ?? "",
            total_used_weight: prog?.total_used_weight ?? "",
            total_no_of_sheets: prog?.total_no_of_sheets ?? "",
            program_remarks: prog?.remarks ?? "",

            // QA
            qa_processed_date: qa?.processed_date ?? "",
            qa_shift: qa?.shift ?? "",
            qa_sheets: qa?.no_of_sheets ?? "",
            qa_cycletime: qa?.cycletime_per_sheet ?? "",
            qa_total_cycle_time: qa?.total_cycle_time ?? "",

            // Machine Logs
            machine_name: log.machine ?? "",
            machine_start: log.start ?? "",
            machine_end: log.end ?? "",
            machine_runtime: log.runtime ?? "",
            machine_air: log.air ?? "",
            machine_operator: log.operator ?? "",

            // Accounts
            acc_invoice_no: acc?.invoice_no ?? "",
            acc_status: acc?.status ?? "",
            acc_remarks: acc?.remarks ?? "",
          });
        });

        return;
      }

      /** CASE 2: No machine logs */
      rows.push({
        ...p,
        material_id: m.id,
        ...m,

        program_no: prog?.program_no ?? "",
        program_date: prog?.program_date ?? "",
        processed_quantity: prog?.processed_quantity ?? "",
        balance_quantity: prog?.balance_quantity ?? "",
        processed_width: prog?.processed_width ?? "",
        processed_length: prog?.processed_length ?? "",
        used_weight: prog?.used_weight ?? "",
        number_of_sheets: prog?.number_of_sheets ?? "",
        cut_length_per_sheet: prog?.cut_length_per_sheet ?? "",
        pierce_per_sheet: prog?.pierce_per_sheet ?? "",
        processed_mins_per_sheet: prog?.processed_mins_per_sheet ?? "",
        total_planned_hours: prog?.total_planned_hours ?? "",
        total_meters: prog?.total_meters ?? "",
        total_piercing: prog?.total_piercing ?? "",
        total_used_weight: prog?.total_used_weight ?? "",
        total_no_of_sheets: prog?.total_no_of_sheets ?? "",
        program_remarks: prog?.remarks ?? "",

        qa_processed_date: qa?.processed_date ?? "",
        qa_shift: qa?.shift ?? "",
        qa_sheets: qa?.no_of_sheets ?? "",
        qa_cycletime: qa?.cycletime_per_sheet ?? "",
        qa_total_cycle_time: qa?.total_cycle_time ?? "",

        machine_name: "",
        machine_start: "",
        machine_end: "",
        machine_runtime: "",
        machine_operator: "",
        machine_air: "",

        acc_invoice_no: acc?.invoice_no ?? "",
        acc_status: acc?.status ?? "",
        acc_remarks: acc?.remarks ?? "",
      });
    });
  });

  return rows;
};

/* ---------------------------------------------------------
   FILTER ROWS
--------------------------------------------------------- */
export const filterRows = (
  rows: FlattenedRow[],
  columnFilters: ColumnFilters,
  fromDate?: string,
  toDate?: string
): FlattenedRow[] => {
  if (!rows.length) return [];

  return rows.filter((row) => {
    // Text filters
    const matches = Object.entries(columnFilters).every(([key, value]) => {
      if (!value) return true;

      return String(row[key] ?? "")
        .toLowerCase()
        .includes(value.toLowerCase());
    });

    if (!matches) return false;

    // --- SAFE DATE HANDLING ---
    const rowDate =
      typeof row.date === "string" || typeof row.date === "number"
        ? new Date(row.date)
        : null;

    if (fromDate && rowDate && rowDate < new Date(fromDate)) return false;

    if (toDate && rowDate && rowDate > new Date(toDate)) return false;

    return true;
  });
};

/* ---------------------------------------------------------
   GET UNIQUE MATERIAL ROW FOR TOTALS
--------------------------------------------------------- */
export const getUniqueProgramRows = (rows: FlattenedRow[]): FlattenedRow[] => {
  if (!rows.length) return [];
  return Object.values(
    rows.reduce((acc: Record<number, FlattenedRow>, row) => {
      if (!acc[row.material_id]) acc[row.material_id] = row;
      return acc;
    }, {})
  );
};

/* ---------------------------------------------------------
   TOTAL CALCULATOR WITH ADVANCED VALIDATION
--------------------------------------------------------- */
export const calculateTotals = (
  rows: FlattenedRow[],
  sumColumns: string[]
): Record<string, number> => {
  const totals: Record<string, number> = {};

  if (!rows.length) {
    sumColumns.forEach((c) => (totals[c] = 0));
    return totals;
  }

  sumColumns.forEach((col) => {
    totals[col] = rows.reduce((acc, row) => {
      const v = row[col];

      // Time fields
      if (
        col === "processed_mins_per_sheet" ||
        col === "total_planned_hours" ||
        col === "qa_total_cycle_time" ||
        col === "machine_runtime"
      ) {
        if (!v || v === "" || v === null || v === undefined) return acc;
        return acc + parseTimeToMinutes(v as string | number);
      }

      const n = Number(v);
      return acc + (isNaN(n) ? 0 : n);
    }, 0);
  });

  return totals;
};
