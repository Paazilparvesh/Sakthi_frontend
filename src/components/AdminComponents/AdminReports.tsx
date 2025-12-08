// import React, { useMemo, useRef, useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Search, X } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";

// // AG Grid imports
// import { AgGridReact } from "ag-grid-react";
// import { ModuleRegistry } from "ag-grid-community";
// import { AllCommunityModule } from "ag-grid-community";
// import { AllEnterpriseModule } from "ag-grid-enterprise";

// ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-quartz.css";
// import "ag-grid-enterprise";

// const AdminReports: React.FC = () => {
//   const gridRef = useRef<any>(null);
//   const { toast } = useToast();

//   /* --------------------------
//      MOCK DATA
//   --------------------------- */
//   const rawData = useMemo(
//     () => [
//       {
//         date: "2025-01-10",
//         company: "Apple",
//         customer: "John Doe",
//         product: "iPhone 15",
//         quantity: 2,
//         amount: 2400,
//         status: "Completed",
//       },
//       {
//         date: "2025-01-12",
//         company: "Apple",
//         customer: "Sarah Smith",
//         product: "MacBook Pro",
//         quantity: 1,
//         amount: 3200,
//         status: "Pending",
//       },
//       {
//         date: "2025-01-15",
//         company: "Apple",
//         customer: "John Doe",
//         product: "AirPods",
//         quantity: 3,
//         amount: 900,
//         status: "Completed",
//       },
//       {
//         date: "2025-01-20",
//         company: "Samsung",
//         customer: "Michael Lee",
//         product: "Galaxy Tab",
//         quantity: 1,
//         amount: 1100,
//         status: "Cancelled",
//       },
//     ],
//     []
//   );

//   /* --------------------------
//      SEARCH + FILTERS
//   --------------------------- */
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

//   const filteredData = useMemo(() => {
//     return rawData.filter((p) => {
//       const match =
//         p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         p.product.toLowerCase().includes(searchQuery.toLowerCase());

//       const statusMatch =
//         statusFilter === "all" || p.status.toLowerCase() === statusFilter;

//       return match && statusMatch;
//     });
//   }, [rawData, searchQuery, statusFilter]);

//   /* --------------------------
//      COLUMN DEFINITIONS
//   --------------------------- */
//   const columnDefs = useMemo(
//     () => [
//       { field: "date", filter: "agDateColumnFilter", minWidth: 140 },
//       { field: "company", filter: "agTextColumnFilter" },
//       { field: "customer", filter: "agTextColumnFilter" },
//       { field: "product", filter: "agTextColumnFilter" },
//       { field: "quantity", filter: "agNumberColumnFilter", aggFunc: "sum" },
//       { field: "amount", filter: "agNumberColumnFilter", aggFunc: "sum" },
//       {
//         field: "status",
//         filter: "agSetColumnFilter",
//         cellRenderer: (params: any) => {
//           const status = params.value.toLowerCase();
//           const color =
//             status === "completed"
//               ? "bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
//               : status === "pending"
//               ? "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs"
//               : "bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs";

//           return `<span class="${color}">${params.value}</span>`;
//         },
//       },
//     ],
//     []
//   );

//   const defaultColDef = useMemo(
//     () => ({
//       resizable: true,
//       filter: true,
//       sortable: true,
//       flex: 1,
//       minWidth: 130,
//     }),
//     []
//   );

//   /* --------------------------
//      EXPORT TO EXCEL
//   --------------------------- */
//   const exportExcel = () => {
//     if (!gridRef.current) return;
//     gridRef.current.api.exportDataAsExcel({
//       sheetName: "Report",
//       fileName: "Report.xlsx",
//     });
//   };

//   return (
//     <div className="text-gray-700 space-y-6">
//       {/* Filters Header */}
//       <div className="flex flex-col sm:flex-row justify-between gap-4">
//         <h2 className="text-2xl font-semibold">Reports</h2>

//         <div className="flex flex-wrap gap-3">
//           {/* Search Box */}
//           <div className="relative">
//             <Search className="absolute left-3 top-3 text-gray-400" />
//             <Input
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9 w-72"
//             />
//             {searchQuery && (
//               <X
//                 className="absolute right-3 top-3 cursor-pointer"
//                 onClick={() => setSearchQuery("")}
//               />
//             )}
//           </div>

//           {/* Status Filter */}
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="border px-3 py-2 rounded-md"
//           >
//             <option value="all">All</option>
//             <option value="pending">Pending</option>
//             <option value="completed">Completed</option>
//             <option value="cancelled">Cancelled</option>
//           </select>

//           {/* Export Button */}
//           <Button className="bg-blue-600 text-white" onClick={exportExcel}>
//             Export
//           </Button>
//         </div>
//       </div>

//       {/* AG Grid Inside Card */}
//       <Card className="border shadow-sm p-2">
//         <div
//           className="ag-theme-quartz"
//           style={{ height: "75vh", width: "100%" }}
//         >
//           <AgGridReact
//             ref={gridRef}
//             rowData={filteredData}
//             columnDefs={columnDefs}
//             defaultColDef={defaultColDef}
//             animateRows={true}
//             enableRangeSelection={true}
//             enableCharts={true}
//             pagination={true}
//             paginationPageSize={20}
//           />
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default AdminReports;




import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminFilteredProducts() {
  const { toast } = useToast();

  // API base URL directly from .env
  const API_URL = import.meta.env.VITE_API_URL;

  // Create axios instance here
  const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
  });

  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,

    serial_number: "",
    company_name: "",
    customer_name: "",

    mat_type: "",
    mat_grade: "",
    bay: "",

    program_no: "",
    program_date: "",

    processed_date: "",

    invoice_no: "",

    sort_by: "",
    sort_order: "asc",
  });

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total_products: 0,
    page_size: 10,
  });

  const [expandedProduct, setExpandedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch filtered data
  const fetchFilteredData = async () => {
    try {
      setLoading(true);

      const res = await api.get("/filter_overall_details/", {
        params: filters,
      });

      setResults(res.data.data);
      setPagination({
        page: res.data.page,
        page_size: res.data.page_size,
        total_products: res.data.total_products,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to load filtered data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount + when sorting/pagination changes
  useEffect(() => {
    fetchFilteredData();
  }, [filters.page, filters.sort_by, filters.sort_order]);

  // Update filter instantly
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      [key]: value,
    }));
  };

  // Expand dropdown
  const toggleExpand = (id) => {
    setExpandedProduct((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold">Filtered Product Overview</h1>

      {/* Filters UI */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input placeholder="Serial Number" value={filters.serial_number} onChange={(e) => updateFilter("serial_number", e.target.value)} />
          <Input placeholder="Company Name" value={filters.company_name} onChange={(e) => updateFilter("company_name", e.target.value)} />
          <Input placeholder="Customer Name" value={filters.customer_name} onChange={(e) => updateFilter("customer_name", e.target.value)} />

          <Input placeholder="Material Type" value={filters.mat_type} onChange={(e) => updateFilter("mat_type", e.target.value)} />
          <Input placeholder="Material Grade" value={filters.mat_grade} onChange={(e) => updateFilter("mat_grade", e.target.value)} />
          <Input placeholder="Bay" value={filters.bay} onChange={(e) => updateFilter("bay", e.target.value)} />

          <Input placeholder="Program No" value={filters.program_no} onChange={(e) => updateFilter("program_no", e.target.value)} />
          <Input type="date" value={filters.program_date} onChange={(e) => updateFilter("program_date", e.target.value)} />

          <Input type="date" value={filters.processed_date} onChange={(e) => updateFilter("processed_date", e.target.value)} />
          <Input placeholder="Invoice No" value={filters.invoice_no} onChange={(e) => updateFilter("invoice_no", e.target.value)} />
        </div>

        <div className="flex gap-4">
          <Button onClick={fetchFilteredData}>Apply Filters</Button>
          <Button
            variant="secondary"
            onClick={() =>
              setFilters({
                page: 1,
                page_size: 10,
                serial_number: "",
                company_name: "",
                customer_name: "",
                mat_type: "",
                mat_grade: "",
                bay: "",
                program_no: "",
                program_date: "",
                processed_date: "",
                invoice_no: "",
                sort_by: "",
                sort_order: "asc",
              })
            }
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Sorting UI */}
      <Card className="p-4 flex gap-4 items-center">
        <Input
          placeholder="Sort by field"
          value={filters.sort_by}
          onChange={(e) => updateFilter("sort_by", e.target.value)}
          className="w-40"
        />

        <select
          className="border px-3 py-2 rounded-md"
          value={filters.sort_order}
          onChange={(e) => updateFilter("sort_order", e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </Card>

      {/* Results Section */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((prod) => (
            <Card key={prod.product_id} className="p-4">
              {/* Product row */}
              <div className="cursor-pointer" onClick={() => toggleExpand(prod.product_id)}>
                <h3 className="text-lg font-semibold flex justify-between">
                  {prod.serial_number} — {prod.company_name}
                  <Badge variant="outline">{expandedProduct === prod.product_id ? "Hide" : "View"}</Badge>
                </h3>
                <p className="text-sm text-gray-600">Customer: {prod.customer_name}</p>
              </div>

              {/* Expand materials */}
              {expandedProduct === prod.product_id && (
                <div className="mt-4 space-y-5">
                  {prod.materials.map((mat) => (
                    <Card key={mat.id} className="p-4 bg-gray-50 border border-gray-200">
                      <h4 className="font-semibold">
                        Material: {mat.mat_type} — {mat.mat_grade}
                      </h4>
                      <p className="text-sm">
                        Bay: {mat.bay} <br />
                        Size: {mat.thick} × {mat.width} × {mat.length}
                      </p>

                      <div className="mt-3">
                        <h5 className="font-semibold text-sm">Programmer Details</h5>
                        <pre className="text-xs bg-white p-2 rounded border">
                          {JSON.stringify(mat.programmer_details, null, 2)}
                        </pre>
                      </div>

                      <div className="mt-3">
                        <h5 className="font-semibold text-sm">QA Details</h5>
                        <pre className="text-xs bg-white p-2 rounded border">
                          {JSON.stringify(mat.qa_details, null, 2)}
                        </pre>
                      </div>

                      <div className="mt-3">
                        <h5 className="font-semibold text-sm">ACC Billing</h5>
                        <pre className="text-xs bg-white p-2 rounded border">
                          {JSON.stringify(mat.acc_details, null, 2)}
                        </pre>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <Button
          disabled={filters.page === 1}
          onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
        >
          Prev
        </Button>

        <span>
          Page {pagination.page} / {Math.ceil(pagination.total_products / pagination.page_size)}
        </span>

        <Button
          disabled={pagination.page * pagination.page_size >= pagination.total_products}
          onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
