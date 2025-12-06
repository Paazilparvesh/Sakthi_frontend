import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { OutwardList } from "@/components/OutwardComponents/OutwardList";
import OutwardDetail from "@/components/OutwardComponents/OutwardDetail";
import { ProductType } from "@/types/inward.type";

import QAForm from "@/components/QAComponents/QAForm"
import AccountForm from "@/components/AccountsComponents/AccountForm";

import { Button } from "@/components/ui/button";


const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    default:
      return "bg-gray-300 text-gray-800 hover:bg-gray-300";
  }
};

interface OutwardDashboardProps {
  role: "qa" | "accounts";
}


const OutwardDashboard: React.FC<OutwardDashboardProps> = ({ role }) => {
  const { toast } = useToast();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState<ProductType[]>([]);
  const [program, setProgram] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [view, setView] = useState<"list" | "detail" | "qaForm" | "accForm">("list");
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const stored = localStorage.getItem("user");
  const parsedUser = stored ? JSON.parse(stored) : null;
  console.log("Parsed User:", parsedUser);
  // const user_roles = parsedUser?.roles[];
  const user_roles = parsedUser?.roles || [];
  console.log("User Roles:", user_roles);



  const programMaterialMap = useMemo(() => {
    const map: Record<number, boolean> = {};

    program.forEach((p) => {
      if (p.material_details) {
        map[p.material_details] = true;
      }
    });

    return map;
  }, [program]);

  const programmedProductIds = useMemo(() => {
    const set = new Set<number>();

    program.forEach((p) => {
      if (p.product_details) {
        set.add(
          typeof p.product_details === "object"
            ? p.product_details.id
            : p.product_details
        );
      }
    });

    return set;
  }, [program]);


  // --------------------------------
  // Fetch Data from New API Endpoint
  // --------------------------------
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const [productRes, programRes] = await Promise.all([
        fetch(`${BASE_URL}/api/get_full_products/`),
        fetch(`${BASE_URL}/api/get_programer_Details/`),
      ]);

      if (!productRes.ok || !programRes.ok) throw new Error("Failed to fetch data");

      const productData = await productRes.json();
      const programData = await programRes.json();

      setProducts(productData);
      setProgram(programData);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Fetch Error",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --------------------------------
  // View Handlers
  // --------------------------------
  const handleView = (product: ProductType) => {
    setSelectedProduct(product);
    setView("detail");
  };

  const handleBack = () => {
    setSelectedProduct(null);
    setView("list");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredProgram = useMemo(() => {
    if (!selectedProduct) return [];
    return program.filter(
      (prog) =>
        Number(prog.product_details) === Number(selectedProduct.id) ||
        (prog.product_details && prog.product_details.id === selectedProduct.id)
    );
  }, [program, selectedProduct]);

  const filteredProduct = useMemo(() => {
    const search = searchQuery.toLowerCase();

    return products
      .filter((item) => {
        const matchesSearch =
          item.company_name?.toLowerCase().includes(search) ||
          item.customer_name?.toLowerCase().includes(search) ||
          item.serial_number?.toLowerCase().includes(search);

        const matchesStatus =
          statusFilter === "all" ||
          item.outward_status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.id - a.id);
  }, [products, searchQuery, statusFilter]);



  // PAGINATION
  const totalPages = Math.ceil(filteredProduct.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProduct.slice(start, start + rowsPerPage);
  }, [filteredProduct, currentPage]);

  // --- derive up-to-date product object from products array to avoid stale selectedProduct
  const currentProduct = useMemo(() => {
    if (!selectedProduct) return null;
    const fresh = products.find((p) => p.id === selectedProduct.id);
    return fresh ?? selectedProduct; // fallback to whatever was selected if not found
  }, [products, selectedProduct]);

  // Check if there's at least one material that:
  // - has programmer data (programMaterialMap[mat.id] === true)
  // - still needs QA (mat.qa_status === 'pending')
  const hasPendingProgrammedMaterial = useMemo(() => {
    if (!currentProduct) return false;
    return (currentProduct.materials || []).some(
      (mat) => programMaterialMap[mat.id] && (String(mat.qa_status).toLowerCase() === "pending")
    );
  }, [currentProduct, programMaterialMap]);


  const hasPendingAccountMaterial = useMemo(() => {
    if (!currentProduct) return false;

    return currentProduct.materials.some(
      (mat) =>
        programMaterialMap[mat.id] && // programmed
        String(mat.acc_status).toLowerCase() === "pending" // account pending
    );
  }, [currentProduct, programMaterialMap]);


  const headerTitle = React.useMemo(() => {
    switch (view) {
      case "list":
        return "Outward Dashboard";
      case "detail":
        return "Product Details";
      case "qaForm":
        return "Qa Update Form";
      case "accForm":
        return "Accounts Update Form";
      default:
        return "Outward Dashboard";
    }
  }, [view]);

  // --------------------------------
  // Render
  // --------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-slate-600 animate-pulse">
          Loading products...
        </p>
      </div>
    );
  }

  const onProceedQA = () => setView("qaForm")
  const onProceedAccount = () => setView("accForm")

  const canProceedQA =
    user_roles.includes("qa") &&
    currentProduct?.outward_status?.toLowerCase() === "pending" &&
    hasPendingProgrammedMaterial;

  const canProceedAccounts =
    user_roles.includes("accounts") &&
    hasPendingAccountMaterial &&
    (currentProduct?.materials || []).every(
      (m) => String(m.qa_status).toLowerCase() === "completed"
    );

  return (
    <div className="p-12">
      <div className="max-w-8xl mx-auto">

        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
            {headerTitle}
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-4">

            {view === "list" && (
              <>
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search by company, customer or serial..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border px-4 py-3 rounded-full w-full sm:w-72 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
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
                  onClick={handleBack}
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
                >
                  Back
                </button>

                {/* Proceed to QA */}
                {canProceedQA && (
                  <Button
                    onClick={onProceedQA}
                    className="bg-blue-700 hover:bg-blue-800 text-white"
                  >
                    Proceed to QA
                  </Button>
                )}

                {/* Proceed to Accounts */}
                {canProceedAccounts && (
                  <Button
                    onClick={onProceedAccount}
                    className="bg-green-700 hover:bg-green-800 text-white"
                  >
                    Proceed to Accounts
                  </Button>
                )}
              </div>
            )}


            {view === "qaForm" && null}

            {view === "accForm" && null}

          </div>
        </div>

        {view === "list" && (
          <>
            <OutwardList
              product={paginatedData}
              onView={handleView}
              role={role}
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

        {view === "detail" && selectedProduct && (
          <OutwardDetail
            product={currentProduct}
            program={filteredProgram}
            getStatusColor={getStatusColor}
          />
        )}

        {view === "qaForm" && selectedProduct && (
          <QAForm
            productId={currentProduct.id}
            companyName={currentProduct.company_name}
            // materials={currentProduct.materials}
            materials={(currentProduct.materials || []).filter(
              (m) => programMaterialMap[m.id] && String(m.qa_status).toLowerCase() === "pending"
            )}
            program={filteredProgram}
            // onBack={() => setView("list")}
            onBack={() => {
              // refresh data (ensures QA button/ detail uses fresh product data)
              fetchProducts();
              setView("detail");
            }}
            onSubmitSuccess={fetchProducts}
          />
        )}


        {view === "accForm" && selectedProduct && (
          <AccountForm
            productId={currentProduct.id}
            companyName={currentProduct.company_name}
            materials={(currentProduct.materials || []).filter(
              (m) =>
                programMaterialMap[m.id] && // programmed
                String(m.acc_status).toLowerCase() === "pending" // account pending only
            )}

            onBack={() => setView("list")}
            onSubmitSuccess={fetchProducts}
          />
        )}

      </div>
    </div>
  );
};

export default OutwardDashboard;
