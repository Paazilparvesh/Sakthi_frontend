
import React, { useState, useEffect } from "react";
import { ProductType, Company, InwardProps } from "@/types/inward.type";
import { validateField } from "@/utils/inwardValidation";

// ⭐ ADDED
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const InwardForm: React.FC<InwardProps> = ({
  formData,
  setFormData,
  setFormErrors,
  formErrors
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // ⭐ ADDED
  const { toast } = useToast();

  // ⭐ ADDED — Add Company Modal State
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    company_name: "",
    customer_name: "",
    contact_no: "",
    customer_dc_no: "",
  });

  useEffect(() => {
    if (formErrors) {
      setErrors(formErrors); // sync errors from dashboard
    }
  }, [formErrors]);

  // 🔹 Fetch company list from API
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/get_companies/`);
        if (!response.ok) throw new Error("Failed to fetch companies");
        const data = await response.json();
        setCompanyList(data);
      } catch (error) {
        console.error("❌ Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [API_URL]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".company-search-container")) setShowSuggestions(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 🔹 Keep search term synced with formData (for back navigation or prefilled data)
  useEffect(() => {
    if (!showSuggestions && formData.company_name !== searchTerm) {
      setSearchTerm(formData.company_name || "");
    }
  }, [formData.company_name, showSuggestions]);

  // 🔹 Search company by name
  const handleSearch = (value: string) => {
    setSearchTerm(value);

    setFormData((prev) => ({
      ...prev,
      company_name: value,
      ...(value !== prev.company_name && {
        customer_name: "",
        contact_no: "",
        customer_dc_no: "",
      })
    }));

    if (value.trim() === "") {
      setFilteredCompanies([]);
      setShowSuggestions(false);
      return;
    }
    const results = companyList.filter((company) =>
      company.company_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCompanies(results);
    setShowSuggestions(true);
  };

  // 🔹 When a company is selected
  const handleSelectCompany = (company: Company) => {
    setFormData((prev) => ({
      ...prev,
      company_name: company.company_name,
      customer_name: company.customer_name,
      contact_no: company.contact_no,
      customer_dc_no: company.customer_dc_no,
    }));
    setSearchTerm(company.company_name);
    setFilteredCompanies([]);
    setShowSuggestions(false);
  };

  const handleChange = (field: keyof ProductType, value: string | number | boolean) => {
    if (
      (field === "serial_number" ||
        field === "inward_slip_number" ||
        field === "customer_dc_no" ||
        field === "contact_no") &&
      !/^\d*$/.test(value.toString())
    )
      return;

    if (field === "contact_no" && value.toString().length === 10) {
      if (!/^[6-9]/.test(value.toString())) {
        setErrors((prev) => ({ ...prev, contact_no: "Mobile number must start with 6–9" }));
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleBlur = (field: keyof ProductType) => {
    const value = formData[field];
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
    setFormErrors((prev) => ({ ...prev, [field]: error }));
    setTimeout(() => setShowSuggestions(false), 150);
  };

  // Save new company
  const handleSaveNewCompany = async () => {
    if (!newCompany.company_name.trim() || !newCompany.customer_name.trim() || !newCompany.contact_no.trim() || !newCompany.customer_dc_no.trim()) {
      toast({
        variant: "destructive",
        title: "All fields are required",
      });
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/api/add_company/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompany),
      });

      const data = await resp.json();
      if (!resp.ok || !data.status) throw new Error(data.message);

      toast({ title: "Company added successfully" });

      setCompanyList((prev) => [...prev, data.company]);

      setFormData((prev) => ({
        ...prev,
        company_name: newCompany.company_name,
        customer_name: newCompany.customer_name,
        contact_no: newCompany.contact_no,
        customer_dc_no: newCompany.customer_dc_no,
      }));

      setShowAddCompanyModal(false);

      setNewCompany({
        company_name: "",
        customer_name: "",
        contact_no: "",
        customer_dc_no: "",
      });

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Add failed",
        description: err.message,
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">

        {/* ===================== Serial Number ===================== */}
        <div>
          <label className="block text-gray-500 mb-1 sm:mb-2 text-sm sm:text-base">
            Serial No.
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={formData.serial_number}
            onChange={(e) => handleChange("serial_number", e.target.value)}
            onBlur={() => handleBlur("serial_number")}
            className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base ${errors.serial_number ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.serial_number && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">
              {errors.serial_number}
            </p>
          )}
        </div>

        {/* ===================== Inward Slip Number ===================== */}
        <div>
          <label className="block text-gray-500 mb-1 sm:mb-2 text-sm sm:text-base">
            Inward Slip No.
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter Inward Slip No."
            value={formData.inward_slip_number}
            onChange={(e) => handleChange("inward_slip_number", e.target.value)}
            onBlur={() => handleBlur("inward_slip_number")}
            className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base ${errors.inward_slip_number ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.inward_slip_number && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">
              {errors.inward_slip_number}
            </p>
          )}
        </div>

        {/* ===================== Color Selection ===================== */}
        <div>
          <p className="text-gray-500 mb-2 text-sm sm:text-base">Select Job Card</p>

          <div className="p-2 rounded-lg">
            <div className="flex items-center gap-4">

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value="yellow"
                  checked={formData.color === "yellow"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm sm:text-base text-gray-700">Yellow</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value="White"
                  checked={formData.color === "White"}
                  onChange={(e) => {
                    handleChange("color", e.target.value);
                    handleBlur("color");
                  }}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm sm:text-base text-gray-700">Quotation</span>
              </label>

            </div>
          </div>

          {errors.color && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.color}</p>
          )}
        </div>

        {/* ===================== Date ===================== */}
        <div>
          <label className="block text-gray-500 mb-1 sm:mb-2 text-sm sm:text-base">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            onBlur={() => handleBlur("date")}
            className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base ${errors.date ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.date && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* ===================== Work Order Number ===================== */}
        <div>
          <label className="block text-gray-500 mb-1 sm:mb-2 text-sm sm:text-base">
            Work Order No.
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={formData.worker_no}
            onChange={(e) => handleChange("worker_no", e.target.value)}
            onBlur={() => handleBlur("worker_no")}
            placeholder="Enter Your Worker No."
            className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base ${errors.worker_no ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.worker_no && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">
              {errors.worker_no}
            </p>
          )}
        </div>

        {/* ================= COMPANY SEARCH ====================== */}
        <div className="relative company-search-container">
          <label className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
            Company Name
          </label>

          <div className="relative">
            <input
              type="text"
              placeholder={
                loading ? "Loading companies..." : "Search or enter company name"
              }
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onBlur={() => handleBlur("company_name")}
              className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base ${errors.company_name ? "border-red-500" : "border-gray-300"
                }`}
              disabled={loading}
            />

          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredCompanies.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-1 max-h-40 overflow-y-auto">
              {filteredCompanies.map((company) => (
                <li
                  key={company.id}
                  onMouseDown={(e) => {
                    e.preventDefault();   // prevents blur from killing the click
                    handleSelectCompany(company);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
                >
                  {company.company_name}
                </li>

              ))}
            </ul>
          )}

          {loading && (
            <p className="text-gray-400 text-xs mt-1">Loading company list...</p>
          )}

          {showSuggestions && !loading && filteredCompanies.length === 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-1">
              <li className="px-4 py-2 text-gray-500 text-sm">
                No companies found.
              </li>

              <li
                className="px-4 py-2 text-blue-600 text-sm hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => setShowAddCompanyModal(true)}
              >
                Add Company
              </li>
            </ul>
          )}


          {errors.company_name && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.company_name}</p>
          )}
        </div>

        {/* ===================== Customer DC ===================== */}
        <div>
          <label className="block text-gray-500 mb-1 sm:mb-2 text-sm sm:text-base">
            Customer Document No.
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter Document number"
              value={formData.customer_dc_no}
              onChange={(e) => handleChange("customer_dc_no", e.target.value)}
              onBlur={() => handleBlur("customer_dc_no")}
              className={`flex-1 border rounded-lg px-3 py-2 text-sm sm:text-base ${errors.customer_dc_no ? "border-red-500" : "border-gray-300"
                }`}
            />
          </div>
          {errors.customer_dc_no && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">
              {errors.customer_dc_no}
            </p>
          )}
        </div>

        {/* ===================== Customer Name ===================== */}
        <div>
          <label className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
            Contact Person Name
          </label>
          <input
            type="text"
            placeholder="Enter Customer name"
            value={formData.customer_name}
            onChange={(e) => handleChange("customer_name", e.target.value)}
            // onBlur={() => handleBlur("customer_name")}
            onBlur={() => {
              setTimeout(() => handleBlur("company_name"), 200);
            }}

            className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base ${errors.customer_name ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.customer_name && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">
              {errors.customer_name}
            </p>
          )}
        </div>

        {/* ===================== Mobile ===================== */}
        <div>
          <label className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
            Contact Peron Mobile No.
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="Enter Customer Mobile No."
            value={formData.contact_no}
            onChange={(e) => handleChange("contact_no", e.target.value)}
            onBlur={() => handleBlur("contact_no")}
            className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base ${errors.contact_no ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.contact_no && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">
              {errors.contact_no}
            </p>
          )}
        </div>
      </div>

      {/* ===================== ADD COMPANY MODAL =============================== */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-blue-600">
              Add Company
            </h2>

            <div className="space-y-3">
              <Input
                placeholder="Company Name *"
                value={newCompany.company_name}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, company_name: e.target.value })
                }
              />

              <Input
                placeholder="Customer Name *"
                value={newCompany.customer_name}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, customer_name: e.target.value })
                }
              />

              <Input
                placeholder="Contact No *"
                maxLength={10}
                value={newCompany.contact_no}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                  setNewCompany({ ...newCompany, contact_no: onlyNums });
                }}
              />


              <Input
                placeholder="Customer DC No *"
                value={newCompany.customer_dc_no}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                  setNewCompany({ ...newCompany, customer_dc_no: onlyNums })
                }}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button className="bg-gray-200 hover:bg-gray-300 text-white" variant="outline" onClick={() => setShowAddCompanyModal(false)}>
                Cancel
              </Button>

              <Button className="bg-blue-600 text-white" onClick={handleSaveNewCompany}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InwardForm;
