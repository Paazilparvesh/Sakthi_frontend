import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { ProductType } from "@/types/inward.type";

/* ---------------------------------------------------- */

const AdminProducts: React.FC = () => {
  const [allDetails, setAllDetails] = useState<ProductType[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [columnFilters, setColumnFilters] = useState({});


  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;


  /* ---------------------------------------------------- */
  /* FETCH ALL DATA */

  const fetchOverallDetails = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/get_overall_details/`);
      const data = await response.json();

      const reversed = data.slice().reverse();
      setAllDetails(reversed);
      setFilteredDetails(reversed);

    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to load product details.",
        variant: "destructive",
      });
    }

    setLoading(false);
  }, [API_URL, toast]);

  useEffect(() => {
    fetchOverallDetails();
  }, [fetchOverallDetails]);

  /* ---------------------------------------------------- */
  /* SELECTION HANDLERS */

  const handleSelectOne = (materialId: number) => {
    setSelectedIds((prev) =>
      prev.includes(materialId)
        ? prev.filter((x) => x !== materialId)
        : [...prev, materialId]
    );
  };


  const handleSelectAll = () => {
    const allVisibleIds = flatRows.map((r) => r.material_id);

    const allSelected = allVisibleIds.every((id) =>
      selectedIds.includes(id)
    );

    if (allSelected) {
      // Unselect only visible rows
      setSelectedIds((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id))
      );
    } else {
      // Select all visible rows + keep previously selected hidden ones
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };


  const getSelectedProductIds = () => selectedIds;

  /* ---------------------------------------------------- */
  /* EXPORT */

  const handleExport = async () => {
    const productIds = getSelectedProductIds();

    if (productIds.length === 0) {
      return toast({
        title: "No Selection",
        description: "Select at least one product.",
        variant: "destructive",
      });
    }

    try {
      const idString = `[${selectedIds.join(",")}]`;

      const res = await fetch(
        `${API_URL}/api/export_specific_details/${idString}/`
      );

      if (!res.ok) {
        return toast({
          title: "Export failed",
          description: "Something went wrong exporting data.",
        });
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `products_export.xlsx`;
      a.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Export Completed",
        description: "Excel downloaded.",
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Backend error occurred.",
        variant: "destructive",
      });
    }
  };

  const updateColumnFilter = (key: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };


  /* ---------------------------------------------------- */
  /* FLATTEN ROWS LIKE EXCEL */

  const flattenRows = (products: ProductType[]) => {
    const rows = [];

    products.forEach((p) => {
      if (!p.materials || p.materials.length === 0) {
        rows.push({ ...p, mat_type: "", thick: "", width: "", length: "" });
        return;
      }

      p.materials.forEach((m) => {
        const prog = m.programer_details?.[0];
        const qa = m.qa_details?.[0];
        const acc = m.account_details?.[0];

        const machineLog = qa?.machines_used
          ?.map((log) => `${log.machine} (${log.start} - ${log.end})`)
          ?.join(", ");

        rows.push({
          ...p,
          material_id: m.id,
          mat_type: m.mat_type,
          mat_grade: m.mat_grade,
          thick: m.thick,
          width: m.width,
          length: m.length,
          density: m.density,
          unit_weight: m.unit_weight,
          quantity: m.quantity,
          total_weight: m.total_weight,
          bay: m.bay,
          stock_due: m.stock_due,
          remarks: m.remarks,

          program_no: prog?.program_no,
          program_date: prog?.program_date,
          processed_quantity: prog?.processed_quantity,
          balance_quantity: prog?.balance_quantity,
          processed_width: prog?.processed_width,
          processed_length: prog?.processed_length,
          used_weight: prog?.used_weight,
          number_of_sheets: prog?.number_of_sheets,
          cut_length_per_sheet: prog?.cut_length_per_sheet,
          pierce_per_sheet: prog?.pierce_per_sheet,
          processed_mins_per_sheet: prog?.processed_mins_per_sheet,
          total_planned_hours: prog?.total_planned_hours,
          total_meters: prog?.total_meters,
          total_piercing: prog?.total_piercing,
          total_used_weight: prog?.total_used_weight,
          total_no_of_sheets: prog?.total_no_of_sheets,
          program_remarks: prog?.remarks,
          created_by__username: prog?.created_by__username,

          // QA
          qa_processed_date: qa?.processed_date,
          qa_shift: qa?.shift,
          qa_sheets: qa?.no_of_sheets,
          qa_cycletime: qa?.cycletime_per_sheet,
          qa_total_cycle_time: qa?.total_cycle_time,
          qa_machines_used: machineLog,
          qa_created_by: qa?.created_by,

          // ACC
          acc_invoice_no: acc?.invoice_no,
          acc_status: acc?.status,
          acc_remarks: acc?.remarks,
          acc_created_by: acc?.created_by__username,
        });
      });
    });

    return rows;
  };

  let flatRows = flattenRows(filteredDetails);

  // Apply column filters
  flatRows = flatRows.filter((row) => {
    return Object.entries(columnFilters).every(([key, value]) => {
      if (!value) return true;

      const rowValue = String((row)[key] ?? "").toLowerCase();
      const filterValue = String(value).toLowerCase();

      return rowValue.includes(filterValue);
    });
  });



  /* ---------------------------------------------------- */

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin mr-2" />
        Loading...
      </div>
    );

  const visibleSelectedCount = flatRows.filter(row =>
    selectedIds.includes(row.material_id)
  ).length;


  return (
    <div className="text-gray-700 space-y-2">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4">

            {visibleSelectedCount > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {visibleSelectedCount} selected
              </span>
            )}

            <Button className="bg-blue-600 text-white" onClick={handleExport}>
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
                      flatRows.every((row) => selectedIds.includes(row.material_id))
                    }
                    onChange={handleSelectAll}
                  />

                </th>

                <th className="border px-2 py-1 min-w-20">S. No.</th>
                <th className="border px-2 py-1 min-w-20">Slip No.</th>
                <th className="border px-2 py-1">Color</th>
                <th className="border px-2 py-1 min-w-32">Date</th>
                <th className="border px-2 py-1 min-w-28">Work Order No.</th>
                <th className="border px-2 py-1 min-w-80">Company Name</th>
                <th className="border px-2 py-1 min-w-32">Customer Dc No.</th>
                <th className="border px-2 py-1 min-w-36">Contact Person Name</th>
                <th className="border px-2 py-1 min-w-36">Contact Person No.</th>


                <th className="border px-2 py-1 min-w-24">Mat. Type</th>
                <th className="border px-2 py-1 min-w-24">Grade</th>
                <th className="border px-2 py-1 min-w-20">Thick</th>
                <th className="border px-2 py-1 min-w-20">Width</th>
                <th className="border px-2 py-1 min-w-20">Length</th>
                <th className="border px-2 py-1 min-w-28">Density</th>
                <th className="border px-2 py-1 min-w-28">Unit Weight</th>
                <th className="border px-2 py-1 min-w-16">Qty</th>
                <th className="border px-2 py-1 min-w-20">Total Weight</th>
                <th className="border px-2 py-1 min-w-20">Bay</th>
                <th className="border px-2 py-1 min-w-20">Stock Due</th>
                <th className="border px-2 py-1 min-w-20">Remarks</th>

                <th className="border px-2 py-1 min-w-32">Program No</th>
                <th className="border px-2 py-1 min-w-36">Program Date</th>
                <th className="border px-2 py-1">Planned Qty</th>
                <th className="border px-2 py-1">Bal Qty</th>
                <th className="border px-2 py-1">Processed Width</th>
                <th className="border px-2 py-1">Processed Length</th>
                <th className="border px-2 py-1">Used Wt</th>
                <th className="border px-2 py-1">No of Sheets</th>
                <th className="border px-2 py-1">Cut Length</th>
                <th className="border px-2 py-1">Pierce</th>
                <th className="border px-2 py-1">Processed Mins</th>
                <th className="border px-2 py-1">Planned Hrs</th>
                <th className="border px-2 py-1">Total Mtr</th>
                <th className="border px-2 py-1">Total Piercing</th>
                <th className="border px-2 py-1">Total Used Wt.</th>
                <th className="border px-2 py-1">Total Sheets</th>
                <th className="border px-2 py-1">Remarks</th>

                <th className="border px-2 py-1">Processed Date</th>
                <th className="border px-2 py-1">Shift</th>
                <th className="border px-2 py-1">Procesed Sheets</th>
                <th className="border px-2 py-1">Cycle Time</th>
                <th className="border px-2 py-1">Total Cycle Time</th>
                <th className="border px-2 py-1">Machine Used</th>

                <th className="border px-2 py-1">Invoice No</th>
                <th className="border px-2 py-1">Accounts Status</th>
                <th className="border px-2 py-1">Remarks</th>

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
                  "qa_machines_used",
                  "qa_created_by",

                  "acc_invoice_no",
                  "acc_status",
                  "acc_remarks",

                ].map((key) => (
                  <th key={key} className="border">
                    <input
                      className="w-full placeholder:text-center text-xs font-light outline-none focus:outline-none focus:ring-0 border-none "
                      placeholder="Search"
                      value={columnFilters[key] || ""}
                      onChange={(e) => updateColumnFilter(key, e.target.value)}
                    />
                  </th>
                ))}
              </tr>
            </thead>


            <tbody>
              {flatRows.map((row, idx) => (
                <tr key={idx} className="border text-center hover:bg-gray-100">
                  <td className="border px-2 py-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.material_id)}
                      onChange={() => handleSelectOne(row.material_id)}
                    />
                  </td>

                  <td className="border px-2 py-1">{row.serial_number}</td>
                  <td className="border px-2 py-1">{row.inward_slip_number}</td>
                  <td className="border px-2 py-1">{row.color}</td>
                  <td className="border px-2 py-1">{row.date}</td>
                  <td className="border px-2 py-1">{row.worker_no}</td>
                  <td className="border px-2 py-1">{row.company_name}</td>
                  <td className="border px-2 py-1">{row.customer_dc_no}</td>
                  <td className="border px-2 py-1">{row.customer_name}</td>
                  <td className="border px-2 py-1">{row.contact_no}</td>

                  <td className="border px-2 py-1">{row.mat_type}</td>
                  <td className="border px-2 py-1">{row.mat_grade}</td>
                  <td className="border px-2 py-1">{row.thick}</td>
                  <td className="border px-2 py-1">{row.width}</td>
                  <td className="border px-2 py-1">{row.length}</td>
                  <td className="border px-2 py-1">{row.density}</td>
                  <td className="border px-2 py-1">{row.unit_weight}</td>
                  <td className="border px-2 py-1">{row.quantity}</td>
                  <td className="border px-2 py-1">{row.total_weight}</td>
                  <td className="border px-2 py-1">{row.bay}</td>
                  <td className="border px-2 py-1">{row.stock_due}</td>
                  <td className="border px-2 py-1">{row.remarks}</td>

                  <td className="border px-2 py-1">{row.program_no}</td>
                  <td className="border px-2 py-1">{row.program_date}</td>
                  <td className="border px-2 py-1">{row.processed_quantity}</td>
                  <td className="border px-2 py-1">{row.balance_quantity}</td>
                  <td className="border px-2 py-1">{row.processed_width}</td>
                  <td className="border px-2 py-1">{row.processed_length}</td>
                  <td className="border px-2 py-1">{row.used_weight}</td>
                  <td className="border px-2 py-1">{row.number_of_sheets}</td>
                  <td className="border px-2 py-1">{row.cut_length_per_sheet}</td>
                  <td className="border px-2 py-1">{row.pierce_per_sheet}</td>
                  <td className="border px-2 py-1">{row.processed_mins_per_sheet}</td>
                  <td className="border px-2 py-1">{row.total_planned_hours}</td>
                  <td className="border px-2 py-1">{row.total_meters}</td>
                  <td className="border px-2 py-1">{row.total_piercing}</td>
                  <td className="border px-2 py-1">{row.total_used_weight}</td>
                  <td className="border px-2 py-1">{row.total_no_of_sheets}</td>
                  <td className="border px-2 py-1">{row.program_remarks}</td>

                  <td className="border px-2 py-1">{row.qa_processed_date}</td>
                  <td className="border px-2 py-1">{row.qa_shift}</td>
                  <td className="border px-2 py-1">{row.qa_sheets}</td>
                  <td className="border px-2 py-1">{row.qa_cycletime}</td>
                  <td className="border px-2 py-1">{row.qa_total_cycle_time}</td>
                  <td className="border px-2 py-1">{row.qa_machines_used}</td>

                  <td className="border px-2 py-1">{row.acc_invoice_no}</td>
                  <td className="border px-2 py-1">{row.acc_status}</td>
                  <td className="border px-2 py-1">{row.acc_remarks}</td>


                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminProducts;
