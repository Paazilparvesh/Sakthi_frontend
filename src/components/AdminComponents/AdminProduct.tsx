import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, X } from "lucide-react";
import AdminProductDetail from "@/components/AdminComponents/AdminProductDetails.tsx";
import AdminEditPage from "./AdminEditPage";
import { ProductType } from "@/types/inward.type";

/* ---------------------------------------------------- */

const AdminProducts: React.FC = () => {
    const [allDetails, setAllDetails] = useState<ProductType[]>([]);
    const [filteredDetails, setFilteredDetails] = useState<ProductType[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const { toast } = useToast();
    const API_URL = import.meta.env.VITE_API_URL;

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState<number | string>(10);

    const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);


    /* ---------------------------------------------------- */
    /* STATUS COLOR UI */
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-100";
            case "completed":
                return "bg-green-100 text-green-700 border border-green-300 hover:bg-green-100";
            default:
                return "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-100";
        }
    };

    /* ---------------------------------------------------- */
    /* FETCH ALL DATA */

    const fetchOverallDetails = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/get_overall_details/`);
            const data = await response.json();

            const reversed = data.slice().reverse(); // FIX FOR DOUBLE REVERSE
            setAllDetails(reversed);
            setFilteredDetails(reversed);

        } catch (err) {
            toast({
                title: "Error",
                description: "Unable to load product details.",
                variant: "destructive"
            });
        }

        setLoading(false);
    }, [API_URL, toast]);

    useEffect(() => {
        fetchOverallDetails();
    }, [fetchOverallDetails]);

    /* ---------------------------------------------------- */
    /* SELECTION HANDLERS */

    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) => {
            const exists = prev.includes(id);
            const next = exists ? prev.filter((s) => s !== id) : [...prev, id];
            console.log("handleSelectOne -> id:", id, "nextSelected:", next);
            return next;
        });
    };

    const handleSelectAll = () => {
        const allFilteredIds = filteredDetails.map((p) => p.product_id);

        const allSelected = allFilteredIds.every((id) => selectedIds.includes(id));

        setSelectedIds(
            allSelected
                ? [] // unselect all
                : allFilteredIds // select all items across all pages
        );
    };




    /* ---------------------------------------------------- */
    /* ID MAPPING FIX */

    const getSelectedProductIds = () => selectedIds;


    /* EXPORT FUNCTION */

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
            // Convert IDs array → "1,2,3"
            const idString = `[${productIds.join(",")}]`;

            const res = await fetch(`${API_URL}/api/export_specific_details/${idString}/`);

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

            toast({ title: "Export Completed", description: "Excel downloaded." });

        } catch (err) {
            console.error("Export Error:", err);
            toast({
                title: "Export Failed",
                description: "Backend error occurred.",
                variant: "destructive",
            });
        }
    };


    useEffect(() => {
        const lower = searchQuery.toLowerCase();

        setFilteredDetails(
            allDetails.filter(p => {
                const match =
                    p.company_name.toLowerCase().includes(lower) ||
                    p.customer_name.toLowerCase().includes(lower) ||
                    p.serial_number.toLowerCase().includes(lower) ||
                    p.inward_slip_number.toLowerCase().includes(lower);

                const statusMatch =
                    statusFilter === "all" ||
                    p.programer_status.toLowerCase() === statusFilter ||
                    p.qa_status.toLowerCase() === statusFilter ||
                    p.outward_status.toLowerCase() === statusFilter;

                return match && statusMatch;
            })
        );
    }, [searchQuery, statusFilter, allDetails]);

    /* ---------------------------------------------------- */
    /* PAGINATION */


    const paginatedData = React.useMemo(() => {
        if (rowsPerPage === "all") return filteredDetails;

        const limit = Number(rowsPerPage);      // Convert safely to number
        const start = (currentPage - 1) * limit;

        return filteredDetails.slice(start, start + limit);
    }, [filteredDetails, currentPage, rowsPerPage]);


    const totalPages = rowsPerPage === "all"
        ? 1
        : Math.ceil(filteredDetails.length / Number(rowsPerPage));


    if (editingProduct)
        return (
            <AdminEditPage
                product={editingProduct}
                onCancel={() => setEditingProduct(null)}
                onBack={fetchOverallDetails}
            />
        );


    /* ---------------------------------------------------- */

    if (loading)
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="animate-spin mr-2" />
                Loading...
            </div>
        );

    if (selectedProduct)
        return (
            <AdminProductDetail
                product={selectedProduct}
                onBack={() => setSelectedProduct(null)}
                onEdit={(p) => {
                    setEditingProduct(p);
                    setSelectedProduct(null);
                }}
            />
        );
    return (
        <div className="text-gray-700 space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h2 className="text-2xl font-semibold">Manage Products</h2>

                <div className="flex flex-wrap gap-3">
                    {/* Search Box */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-80"
                        />
                        {searchQuery && (
                            <X
                                className="absolute right-3 top-3 cursor-pointer"
                                onClick={() => setSearchQuery("")}
                            />
                        )}
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border px-3 py-2 rounded-md"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>

                    {/* Action Buttons */}
                    {/* {selectedIds.length > 0 && (
                        <div className="flex gap-2">
                            <Button className="bg-blue-600 text-white" onClick={handleExport}>
                                Export
                            </Button>
                        </div> */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-4">

                            {/* Selected Count Badge */}
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {selectedIds.length} selected
                            </span>

                            {/* Export Button */}
                            <Button className="bg-blue-600 text-white" onClick={handleExport}>
                                Export
                            </Button>
                        </div>
                    )}

                    {/* )} */}
                </div>
            </div>

            {/* Table */}
            <Card className="border shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-100 border text-center">
                                <th className="border px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={
                                            filteredDetails.length > 0 &&
                                            filteredDetails.every((p) => selectedIds.includes(p.product_id))
                                        }

                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="border px-4 py-2">Serial No.</th>
                                <th className="border px-4 py-2">Slip No.</th>
                                <th className="border px-4 py-2">Date</th>
                                <th className="border px-4 py-2">Company</th>
                                <th className="border px-4 py-2">Customer</th>
                                <th className="border px-4 py-2">Color</th>
                                <th className="border px-4 py-2">Created By</th>
                                <th className="border px-4 py-2">Program</th>
                                <th className="border px-4 py-2">QA</th>
                                <th className="border px-4 py-2">Outward</th>
                                <th className="border px-4 py-2">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedData.map((p) => (
                                <tr key={p.product_id} className="border text-center hover:bg-gray-100">
                                    <td className="border px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(p.product_id)}
                                            onChange={() => handleSelectOne(p.product_id)}
                                        />

                                    </td>
                                    <td className="border px-4 py-2">{p.serial_number}</td>
                                    <td className="border px-4 py-2">{p.inward_slip_number}</td>
                                    <td className="border px-4 py-2">{p.date}</td>
                                    <td className="border px-4 py-2">{p.company_name}</td>
                                    <td className="border px-4 py-2">{p.customer_name}</td>
                                    <td className="border px-4 py-2">{p.color}</td>
                                    <td className="border px-4 py-2">{p.created_by || "-"}</td>
                                    <td className="border px-4 py-2">
                                        <Badge className={getStatusColor(p.programer_status)}>
                                            {p.programer_status}
                                        </Badge>
                                    </td>
                                    <td className="border px-4 py-2">
                                        <Badge className={getStatusColor(p.qa_status)}>
                                            {p.qa_status}
                                        </Badge>
                                    </td>
                                    <td className="border px-4 py-2">
                                        <Badge className={getStatusColor(p.outward_status)}>
                                            {p.outward_status}
                                        </Badge>
                                    </td>

                                    <td className="border px-4 py-2">
                                        <Button
                                            size="sm"
                                            className="bg-blue-600 text-white"
                                            onClick={() => setSelectedProduct(p)}
                                        >
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Pagination Buttons */}
            <div className="flex justify-between items-center mt-5">

                {/* Page Size Selector */}
                <div className="flex items-center gap-3">
                    <span className="text-sm">Rows per page:</span>

                    <select
                        value={rowsPerPage}
                        onChange={(e) => {
                            const value = e.target.value === "all"
                                ? "all"
                                : Number(e.target.value);   // convert to number
                            setRowsPerPage(value);
                            setCurrentPage(1);
                        }}
                        className="border rounded-md px-2 py-1"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value="all">All</option>
                    </select>

                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-3">
                    <Button
                        disabled={currentPage === 1 || rowsPerPage === "all"}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        Prev
                    </Button>

                    <span>
                        Page {currentPage} / {totalPages}
                    </span>

                    <Button
                        disabled={currentPage === totalPages || rowsPerPage === "all"}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default AdminProducts;