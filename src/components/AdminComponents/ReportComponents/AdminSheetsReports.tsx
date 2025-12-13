
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { ProductType } from "@/types/inward.type";
import axios from "axios";

import {
  flattenRows,
  filterRows,
  getUniqueProgramRows,
  calculateTotals,
  formatMinutesToTime,
  parseTimeToMinutes,
  FlattenedRow
} from "@/utils/productsTableUtils";


/** Display a numeric or HH:MM time as HH:MM; show "—" when missing */
const displayTime = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";

  const mins = parseTimeToMinutes(value as string | number);

  // Safe type‐narrowing BEFORE comparison
  const stringVal = typeof value === "string" ? value : undefined;
  const numberVal = typeof value === "number" ? value : undefined;

  if (
    mins === 0 &&
    (stringVal === "0" || numberVal === 0 || stringVal === "00:00")
  ) {
    return formatMinutesToTime(0);
  }

  return formatMinutesToTime(mins);
};

/** Display numbers with safety and optional decimal places; show "—" when missing */
const displayNumber = (
  value: unknown,
  decimals?: number
): string => {

  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  if (decimals !== undefined) return n.toFixed(decimals);
  return String(n);
};


/* --------------------------- Component ----------------------------- */

const AdminProducts: React.FC = () => {
  const [allDetails, setAllDetails] = useState<ProductType[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  const TOTAL_ROW_ID = -9999;



  /* ------------------------ Fetch data ------------------------ */
  const fetchOverallDetails = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/get_overall_details/`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      // defensive: ensure array
      const arr = Array.isArray(data) ? data : [];
      const reversed = arr.slice();

      setAllDetails(reversed);
      setFilteredDetails(reversed);
    } catch (err) {
      if (err.name === "AbortError") {
        // aborted — ignore
      } else {
        console.error("fetchOverallDetails:", err);
        toast({
          title: "Error",
          description: "Unable to load product details.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [API_URL, toast]);

  useEffect(() => {
    fetchOverallDetails();
  }, [fetchOverallDetails]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        // toggle direction
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc"
        };
      }
      return { key, direction: "asc" };
    });
  };


  const sortedDetails = React.useMemo(() => {
    if (!sortConfig) return filteredDetails;

    return [...filteredDetails].sort((a, b) => {
      const aVal = String(a[sortConfig.key] ?? "").toLowerCase();
      const bVal = String(b[sortConfig.key] ?? "").toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  }, [filteredDetails, sortConfig]);

  /* ----------------------- Selection handlers ---------------------- */
  const handleSelectOne = useCallback((materialId: number) => {
    setSelectedIds((prev) =>
      prev.includes(materialId) ? prev.filter((x) => x !== materialId) : [...prev, materialId]
    );
  }, []);

  // We compute flatRows later; put handler as callback to reference up-to-date flatRows in runtime
  const handleSelectAll = useCallback(
    (flatRowsArg: FlattenedRow[]) => {
      const allVisibleIds = flatRowsArg
        .map((r) => r.material_id)
        .filter((id) => id !== TOTAL_ROW_ID);

      const allSelected = allVisibleIds.every((id) => selectedIds.includes(id));

      setSelectedIds((prev) =>
        allSelected
          ? prev.filter((id) => !allVisibleIds.includes(id))
          : Array.from(new Set([...prev, ...allVisibleIds]))
      );
    },
    [selectedIds, TOTAL_ROW_ID]
  );

  const updateColumnFilter = useCallback((key: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* ---------------------- Table data pipeline --------------------- */

  // Step 1: Flatten all product details (memoized)
  const flatRowsInitial = useMemo(() => flattenRows(sortedDetails), [sortedDetails]);

  // Step 2: Apply filters (columns + date)
  const flatRows = useMemo(
    () => filterRows(flatRowsInitial, columnFilters || {}, fromDate || undefined, toDate || undefined),
    [flatRowsInitial, columnFilters, fromDate, toDate]
  );

  // Step 3: Unique rows for totals
  const uniqueProgramRows = useMemo(() => getUniqueProgramRows(flatRows), [flatRows]);

  // columns to sum
  const sumColumns = useMemo(
    () => [
      "thick",
      "width",
      "length",
      "unit_weight",
      "quantity",
      "total_weight",
      "processed_quantity",
      "balance_quantity",
      "processed_width",
      "processed_length",
      "used_weight",
      "number_of_sheets",
      "cut_length_per_sheet",
      "pierce_per_sheet",
      "processed_mins_per_sheet",
      "total_planned_hours",
      "total_meters",
      "total_piercing",
      "total_used_weight",
      "total_no_of_sheets",
      "qa_sheets",
      "qa_cycletime",
      "qa_total_cycle_time",
      "machine_runtime",
    ],
    []
  );

  // Step 4: Compute totals (note calculateTotals returns numeric minutes for time columns)
  const totals = useMemo(() => calculateTotals(uniqueProgramRows, sumColumns), [uniqueProgramRows, sumColumns]);

  // ------------------ Memoized totals row ------------------
  const totalsRowData = useMemo(() => ({
    material_id: TOTAL_ROW_ID,
    serial_number: "TOTAL",
    inward_slip_number: "",
    color: "",
    date: "",
    worker_no: "",
    company_name: "",
    customer_dc_no: "",
    customer_name: "",
    contact_no: "",

    mat_type: "",
    mat_grade: "",
    thick: totals["thick"] ?? 0,
    width: totals["width"] ?? 0,
    length: totals["length"] ?? 0,
    density: "",
    unit_weight: totals["unit_weight"] ?? 0,
    quantity: totals["quantity"] ?? 0,
    total_weight: totals["total_weight"] ?? 0,
    bay: "",
    stock_due: "",
    remarks: "",

    program_no: "",
    program_date: "",
    processed_quantity: totals["processed_quantity"] ?? 0,
    balance_quantity: totals["balance_quantity"] ?? 0,
    processed_width: totals["processed_width"] ?? 0,
    processed_length: totals["processed_length"] ?? 0,
    used_weight: totals["used_weight"] ?? 0,
    number_of_sheets: totals["number_of_sheets"] ?? 0,
    cut_length_per_sheet: totals["cut_length_per_sheet"] ?? 0,
    pierce_per_sheet: totals["pierce_per_sheet"] ?? 0,
    processed_mins_per_sheet: totals["processed_mins_per_sheet"] ?? 0,
    total_planned_hours: totals["total_planned_hours"] ?? 0,
    total_meters: totals["total_meters"] ?? 0,
    total_piercing: totals["total_piercing"] ?? 0,
    total_used_weight: totals["total_used_weight"] ?? 0,
    total_no_of_sheets: totals["total_no_of_sheets"] ?? 0,
    program_remarks: "",

    qa_processed_date: "",
    qa_shift: "",
    qa_sheets: totals["qa_sheets"] ?? 0,
    qa_cycletime: totals["qa_cycletime"] ?? 0,
    qa_total_cycle_time: totals["qa_total_cycle_time"] ?? 0,

    machine_name: "",
    machine_start: "",
    machine_end: "",
    machine_runtime: totals["machine_runtime"] ?? 0,
    machine_operator: "",
    machine_air: "",

    acc_invoice_no: "",
    acc_status: "",
    acc_remarks: "",
  }), [totals, TOTAL_ROW_ID]);

  async function exportSelectedRows(rows: any[]) {
    const API_URL = import.meta.env.VITE_API_URL;

    const response = await axios.post(
      `${API_URL}/api/export_selected_rows/`,
      { rows },
      {
        responseType: "blob",
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data; // <- blob
  }

  const handleExport = async () => {
    const selected = selectedIds;

    if (!selected || selected.length === 0) {
      toast({
        title: "No Selection",
        description: "Select at least one row.",
        variant: "destructive",
      });
      return;
    }

    // 1️⃣ Collect rows to export
    const selectedRows = flatRows.filter(r => selected.includes(r.material_id));

    // 2️⃣ Add totals row if selected
    if (selected.includes(TOTAL_ROW_ID)) {
      selectedRows.push(totalsRowData);
    }

    if (selectedRows.length === 0) {
      toast({
        title: "No Data",
        description: "No rows to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = await exportSelectedRows(selectedRows);

      // 3️⃣ Trigger file download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "production_export.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Excel exported successfully!",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Export Failed",
        description: err?.message ?? "Something went wrong.",
        variant: "destructive",
      });
    }
  };



  /* ----------------------- Derived values ------------------------- */

  const visibleSelectedCount = useMemo(() => {
    const countNormal = flatRows.filter(row =>
      selectedIds.includes(row.material_id)
    ).length;

    const countTotal = selectedIds.includes(TOTAL_ROW_ID) ? 1 : 0;

    return countNormal + countTotal;
  }, [flatRows, selectedIds, TOTAL_ROW_ID]);





  /* --------------------------- UI Render -------------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  return (
    <div className="text-gray-700 space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-semibold">Production Report Dashboard</h2>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4">
            {visibleSelectedCount > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {visibleSelectedCount} selected
              </span>
            )}

            <Button className="bg-blue-600 text-white" onClick={() => handleExport()}>
              Export
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="border shadow-sm">
        <div className="overflow-auto max-h-[58vh] w-full" style={{ scrollbarWidth: "thin" }}>
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-20 bg-slate-200 shadow w-full">
              {/* Column Labels */}
              <tr className="text-center bg-slate-100 w-full">
                <th className="px-2 py-1 bg-white">
                  <input
                    type="checkbox"
                    checked={
                      flatRows.length > 0 &&
                      flatRows.every((row) => selectedIds.includes(row.material_id)) &&
                      selectedIds.includes(TOTAL_ROW_ID)
                    }
                    onChange={() => {
                      handleSelectAll(flatRows);
                      handleSelectOne(TOTAL_ROW_ID);
                    }}
                  />

                </th>

                {/* ... keep all your column headers unchanged ... */}
                {/* <th className="border px-2 py-1 min-w-20">S. No.</th> */}
                <th
                  className="border px-4 py-2 cursor-pointer select-none"
                  onClick={() => handleSort("serial_number")}
                >
                  <div className="flex items-center justify-center gap-1">
                    S No.

                    {sortConfig?.key === "serial_number" ? (
                      sortConfig.direction === "asc" ? (
                        <span className="text-gray-600">↑</span>
                      ) : (
                        <span className="text-gray-600">↓</span>
                      )
                    ) : (
                      <span className="text-gray-400">↕</span>
                    )}
                  </div>
                </th>
                <th className="border px-2 py-1 min-w-20">Slip No.</th>
                <th className="border px-2 py-1">Color</th>
                <th className="border px-2 py-1 min-w-32">Date</th>
                <th className="border px-2 py-1 min-w-28">WO. No.</th>
                <th className="border px-2 py-1 min-w-80">Company Name</th>
                <th className="border px-2 py-1 min-w-32">Customer Dc No.</th>
                <th className="border px-2 py-1 min-w-36">Customer Name</th>
                <th className="border px-2 py-1 min-w-36">Contact No.</th>

                <th className="border px-2 py-1 min-w-24">Mat. Type</th>
                <th className="border px-2 py-1 min-w-24">Grade</th>
                <th className="border px-2 py-1 min-w-20">Thick</th>
                <th className="border px-2 py-1 min-w-20">Width</th>
                <th className="border px-2 py-1 min-w-20">Length</th>
                <th className="border px-2 py-1 min-w-28">Density</th>
                <th className="border px-2 py-1 min-w-28">Unit Wt.</th>
                <th className="border px-2 py-1 min-w-16">Qty</th>
                <th className="border px-2 py-1 min-w-20">Total Wt.</th>
                <th className="border px-2 py-1 min-w-20">Bay</th>
                <th className="border px-2 py-1 min-w-24">Stock Due</th>
                <th className="border px-2 py-1 min-w-36">Remarks</th>

                <th className="border px-2 py-1 min-w-32">Program No.</th>
                <th className="border px-2 py-1 min-w-36">Program Date</th>
                <th className="border px-2 py-1 min-w-28">processed Qty</th>
                <th className="border px-2 py-1 min-w-24">Bal Qty</th>
                <th className="border px-2 py-1 min-w-36">Processed Width</th>
                <th className="border px-2 py-1 min-w-36">Processed Length</th>
                <th className="border px-2 py-1 min-w-24">Used Wt.</th>
                <th className="border px-2 py-1 min-w-28">No of Sheets</th>
                <th className="border px-2 py-1 min-w-28">Cut Length</th>
                <th className="border px-2 py-1 min-w-24">Pierce</th>
                <th className="border px-2 py-1 min-w-28">Processed Mins/Sheet</th>
                <th className="border px-2 py-1 min-w-36">Total Processed mins/Sheet</th>
                <th className="border px-2 py-1 min-w-24">Total Mtr</th>
                <th className="border px-2 py-1 min-w-28">Total Piercing</th>
                <th className="border px-2 py-1 min-w-28">Total Used Wt.</th>
                <th className="border px-2 py-1 min-w-36">Total Sheets</th>
                <th className="border px-2 py-1 min-w-36">Remarks</th>

                <th className="border px-2 py-1 min-w-36">Qa Processed Date</th>
                <th className="border px-2 py-1 min-w-24">Shift</th>
                <th className="border px-2 py-1 min-w-36">Procesed Sheets</th>
                <th className="border px-2 py-1 min-w-28">Cycle Time</th>
                <th className="border px-2 py-1 min-w-36">Total Cycle Time</th>
                <th className="border px-2 py-1 min-w-28">Machine</th>
                <th className="border px-2 py-1 min-w-24">Start</th>
                <th className="border px-2 py-1 min-w-24">End</th>
                <th className="border px-2 py-1 min-w-24">Runtime</th>
                <th className="border px-2 py-1 min-w-36">Operator</th>
                <th className="border px-2 py-1 min-w-24">Air</th>

                <th className="border px-2 py-1 min-w-36">Invoice No</th>
                <th className="border px-2 py-1 min-w-36">Accounts Status</th>
                <th className="border px-2 py-1 min-w-36">Remarks</th>
              </tr>

              {/* FILTER Inputs */}
              <tr className="bg-white text-center">
                <th className="border-none px-2"></th>

                {[
                  "serial_number",
                  "inward_slip_number",
                  "color",
                  "date",
                  "worker_no",
                  "company_name",
                  "customer_dc_no",
                  "customer_name",
                  "contact_no",

                  "mat_type",
                  "mat_grade",
                  "thick",
                  "width",
                  "length",
                  "density",
                  "unit_weight",
                  "quantity",
                  "total_weight",
                  "bay",
                  "stock_due",
                  "remarks",

                  "program_no",
                  "program_date",
                  "processed_quantity",
                  "balance_quantity",
                  "processed_width",
                  "processed_length",
                  "used_weight",
                  "number_of_sheets",
                  "cut_length_per_sheet",
                  "pierce_per_sheet",
                  "processed_mins_per_sheet",
                  "total_planned_hours",
                  "total_meters",
                  "total_piercing",
                  "total_used_weight",
                  "total_no_of_sheets",
                  "program_remarks",

                  "qa_processed_date",
                  "qa_shift",
                  "qa_sheets",
                  "qa_cycletime",
                  "qa_total_cycle_time",

                  "machine_name",
                  "machine_start",
                  "machine_end",
                  "machine_runtime",
                  "machine_operator",
                  "machine_air",

                  "acc_invoice_no",
                  "acc_status",
                  "acc_remarks",
                ].map((key) => (
                  <th key={key} className="border">
                    {key === "date" ? (
                      <div className="max-w-56 flex gap-3 scale-75 items-center justify-center">
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="border p-2 rounded text-xs"
                          placeholder="From Date"
                        />
                        <span className="scale-150">{"-"}</span>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="border p-2 rounded text-xs"
                        />
                      </div>
                    ) : (
                      <input
                        className="w-full placeholder:text-center text-xs font-light outline-none focus:outline-none focus:ring-0 border-none "
                        placeholder="Search"
                        value={columnFilters[key] || ""}
                        onChange={(e) => updateColumnFilter(key, e.target.value)}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {flatRows.map((row: FlattenedRow) => {
                const safe = (v: unknown) => (v == null || v === "") ? "—" : String(v);
                return (
                  <tr key={`${row.material_id}-${row.machine_start}-${row.machine_end}`} className="border text-center hover:bg-gray-100">
                    <td className="border px-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.material_id)}
                        onChange={() => handleSelectOne(row.material_id)}
                      />
                    </td>

                    <td className="border px-2 py-1">{safe(row.serial_number ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.inward_slip_number ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.color ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.date ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.worker_no ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.company_name ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.customer_dc_no ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.customer_name ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.contact_no ?? "—")}</td>

                    <td className="border px-2 py-1">{safe(row.mat_type ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.mat_grade ?? "—")}</td>
                    <td className="border px-2 py-1">{displayNumber(row.thick)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.width)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.length)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.density)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.unit_weight, 3)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.quantity)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.total_weight, 3)}</td>
                    <td className="border px-2 py-1">{safe(row.bay ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.stock_due ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.remarks ?? "—")}</td>

                    <td className="border px-2 py-1">{safe(row.program_no ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.program_date ?? "—")}</td>
                    <td className="border px-2 py-1">{displayNumber(row.processed_quantity)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.balance_quantity)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.processed_width)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.processed_length)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.used_weight)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.number_of_sheets)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.cut_length_per_sheet)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.pierce_per_sheet)}</td>
                    <td className="border px-2 py-1">{displayTime(row.processed_mins_per_sheet)}</td>

                    <td className="border px-2 py-1">{displayTime(row.total_planned_hours)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.total_meters)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.total_piercing)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.total_used_weight)}</td>
                    <td className="border px-2 py-1">{displayNumber(row.total_no_of_sheets)}</td>
                    <td className="border px-2 py-1">{safe(row.program_remarks ?? "—")}</td>

                    <td className="border px-2 py-1">{safe(row.qa_processed_date ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.qa_shift ?? "—")}</td>
                    <td className="border px-2 py-1">{displayNumber(row.qa_sheets)}</td>
                    <td className="border px-2 py-1">{displayTime(row.qa_cycletime)}</td>
                    <td className="border px-2 py-1">{displayTime(row.qa_total_cycle_time)}</td>

                    <td className="border px-2 py-1">{safe(row.machine_name ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.machine_start ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.machine_end ?? "—")}</td>
                    <td className="border px-2 py-1">{displayTime(row.machine_runtime)}</td>
                    <td className="border px-2 py-1">{safe(row.machine_operator ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.machine_air ?? "—")}</td>

                    <td className="border px-2 py-1">{safe(row.acc_invoice_no ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.acc_status ?? "—")}</td>
                    <td className="border px-2 py-1">{safe(row.acc_remarks ?? "—")}</td>
                  </tr>
                )
              }
              )}
              <tr className="text-center bg-slate-200 font-semibold sticky bottom-0 z-20">
                <td className="border px-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(TOTAL_ROW_ID)}
                    onChange={() => handleSelectOne(TOTAL_ROW_ID)}
                  />
                </td>
                <td className="border px-2 py-1">Total</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{totals["thick"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["width"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["length"] ?? 0}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{(totals["unit_weight"] ?? 0).toFixed(3)}</td>
                <td className="border px-2 py-1">{totals["quantity"] ?? 0}</td>
                <td className="border px-2 py-1">{(totals["total_weight"] ?? 0).toFixed(3)}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{totals["processed_quantity"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["balance_quantity"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["processed_width"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["processed_length"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["used_weight"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["number_of_sheets"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["cut_length_per_sheet"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["pierce_per_sheet"] ?? 0}</td>
                <td className="border px-2 py-1">{formatMinutesToTime(totals["processed_mins_per_sheet"] ?? 0)}</td>
                <td className="border px-2 py-1">{formatMinutesToTime(totals["total_planned_hours"] ?? 0)}</td>
                <td className="border px-2 py-1">{totals["total_meters"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["total_piercing"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["total_used_weight"] ?? 0}</td>
                <td className="border px-2 py-1">{totals["total_no_of_sheets"] ?? 0}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{totals["qa_sheets"] ?? 0}</td>
                <td className="border px-2 py-1">{formatMinutesToTime(totals["qa_cycletime"] ?? 0)}</td>
                <td className="border px-2 py-1">{formatMinutesToTime(totals["qa_total_cycle_time"] ?? 0)}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{formatMinutesToTime(totals["machine_runtime"] ?? 0)}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
                <td className="border px-2 py-1">{"-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminProducts;
