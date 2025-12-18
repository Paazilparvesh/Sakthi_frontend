import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { OutwardList } from "@/components/OutwardComponents/OutwardList";
import OutwardDetail from "@/components/OutwardComponents/OutwardDetail";
import AccountForm from "@/components/AccountsComponents/AccountForm";
import { ProductType } from "@/types/inward.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const getStatusColor = (status: string): string =>
  status?.toLowerCase() === "completed"
    ? "bg-green-100 text-green-800"
    : status?.toLowerCase() === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-300 text-gray-800";

const AccountsDashboard: React.FC = () => {
  const { toast } = useToast();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState<ProductType[]>([]);
  const [program, setProgram] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [view, setView] = useState<"list" | "detail" | "accForm">("list");
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Load user
  const stored = localStorage.getItem("user");
  const user_roles = stored ? JSON.parse(stored).roles || [] : [];

  const safeArray = (data) => (Array.isArray(data) ? data : []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const [productRes, programRes] = await Promise.all([
        fetch(`${BASE_URL}/api/get_full_products/`),
        fetch(`${BASE_URL}/api/get_programer_Details/`),
      ]);

      // If API returns 404 or error JSON, parse safely
      let productData = [];
      let programData = [];

      try {
        productData = await productRes.json();
      } catch {
        productData = [];
      }

      try {
        programData = await programRes.json();
      } catch {
        programData = [];
      }

      // Normalize to arrays
      setProducts(safeArray(productData));
      setProgram(safeArray(programData));

      if (!Array.isArray(productData)) {
        toast({
          title: "Products Not Found",
          description: "Server returned invalid or empty response.",
          variant: "destructive",
        });
      }

      if (!Array.isArray(programData)) {
        toast({
          title: "Program Details Not Found",
          description: "Server returned invalid or empty response.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fetch Error",
        description: "Failed to load dashboard data",
      });
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const programMaterialMap = useMemo(() => {
    const map: Record<number, boolean> = {};
    program.forEach((p) => {
      if (p.material_details) map[p.material_details] = true;
    });
    return map;
  }, [program]);

  const filteredProducts = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return products.filter((item) => {
      const matchSearch =
        item.company_name?.toLowerCase().includes(search) ||
        item.customer_name?.toLowerCase().includes(search) ||
        item.inward_slip_number?.toLowerCase().includes(search);

      const matchStatus =
        statusFilter === "all" ||
        item.outward_status?.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    })
      .sort((a, b) => b.id - a.id);
  }, [products, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, currentPage]);

  const filteredProgram = useMemo(() => {
    if (!selectedProduct) return [];
    return program.filter(
      (p) =>
        Number(p.product_details) === Number(selectedProduct.id) ||
        p.product_details?.id === selectedProduct.id
    );
  }, [program, selectedProduct]);

  const currentProduct = useMemo(() => {
    if (!selectedProduct) return null;
    return products.find((p) => p.id === selectedProduct.id) || selectedProduct;
  }, [products, selectedProduct]);

  // Pending account conditions
  const hasPendingAccountMaterial = useMemo(() => {
    if (!currentProduct) return false;

    return currentProduct.materials?.some(
      (mat) =>
        programMaterialMap[mat.id] &&
        String(mat.acc_status).toLowerCase() === "pending"
    );
  }, [currentProduct, programMaterialMap]);

  const canProceedAccounts =
    user_roles.includes("accounts") &&
    hasPendingAccountMaterial &&
    currentProduct?.outward_status?.toLowerCase() === "pending";

  const programMap = useMemo(() => {
    const map: Record<number, string> = {};
    program.forEach(p => {
      const id = typeof p.material_details === "object" ? p.material_details.id : p.material_details;
      map[id] = p.program_date;
    });
    return map;
  }, [program]);


  const headerTitle = React.useMemo(() => {
    switch (view) {
      case "list":
        return "Accounts Dashboard";
      case "detail":
        return "Accounts Details";
      default:
        return "Accounts Dashboard";
    }
  }, [view]);

  return (
    <div className="p-12">
      <div className="max-w-8xl mx-auto">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
            {headerTitle}
          </h1>

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row items-center gap-4">

            {view === "list" && (
              <>
                <input
                  type="text"
                  placeholder="Search by company, customer or serial..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border px-4 py-3 rounded-full w-full sm:w-72 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border px-4 py-2 rounded-lg"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </>
            )}

            {view === "detail" && (
              <div className="flex gap-4">
                <button
                  onClick={() => setView("list")}
                  className='px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm'
                >
                  Back
                </button>

                {canProceedAccounts && (
                  <Button
                    onClick={() => setView("accForm")}
                    className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                  >
                    Proceed to Accounts
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">

            {/* LIST */}
            {view === "list" && (
              <>
                {paginatedData.length === 0 ? (
                  <div className="flex justify-center items-center py-20">
                    <p className="text-lg font-medium text-slate-600">
                      No product found.
                    </p>
                  </div>
                ) : (
                  <>
                    <OutwardList
                      product={paginatedData}
                      onView={(p) => {
                        setSelectedProduct(p);
                        setView("detail");
                      }}
                      getStatusColor={getStatusColor}
                    />
                    {/* Pagination Buttons */}
                    {totalPages > 1 && (
                      <div className="flex justify-end items-center gap-3 mt-6 text-sm">

                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => prev - 1)}
                          className="px-4 py-1 bg-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-300"
                        >
                          Prev
                        </button>

                        <span className="font-medium text-slate-700">
                          Page {currentPage} / {totalPages}
                        </span>

                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          className="px-4 py-1 bg-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-300"
                        >
                          Next
                        </button>

                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* DETAIL */}
            {view === "detail" && currentProduct && (
              <OutwardDetail
                product={currentProduct}
              />
            )}

            {/* ACCOUNTS FORM */}
            {view === "accForm" && currentProduct && (
              <AccountForm
                productId={currentProduct.id}
                companyName={currentProduct.company_name}
                materials={currentProduct.materials.filter(
                  (m) =>
                    programMaterialMap[m.id] &&
                    String(m.acc_status).toLowerCase() === "pending"
                )}
                onBack={() => setView("detail")}
                onSubmitSuccess={fetchProducts}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountsDashboard;
