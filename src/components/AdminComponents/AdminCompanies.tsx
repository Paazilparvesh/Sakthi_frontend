import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Upload, FileText, X, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import { Company } from "@/types/inward.type";

/* -------------------- TYPES (MATCH BACKEND) -------------------- */

/* -------------------- COMPONENT -------------------- */
const AdminCompanies: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { toast } = useToast();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  // ADD & BULK UPLOAD modal
  const [openModal, setOpenModal] = useState(false);

  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  // EDIT MODAL
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editForm, setEditForm] = useState<Partial<Company>>({});
  const [actionLoading, setActionLoading] = useState(false);

  // Bulk Upload
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [previewCompanies, setPreviewCompanies] = useState<Company[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;


  // Add Company Form
  const [formData, setFormData] = useState({
    company_name: "",
    customer_name: "",
    contact_no: "",
    customer_dc_no: "",
  });

  // Search
  const [query, setQuery] = useState("");

  /* -------------------- FETCH COMPANIES -------------------- */
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/get_companies/`);
      const data = await resp.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load companies.",
      });
    } finally {
      setLoading(false);
    }
  }, [API_URL, toast]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  /* -------------------- HELPERS -------------------- */
  const uniqueCompanies = useMemo(() => {
    const seen = new Set();
    return companies.filter((c) => {
      const key = `${c.company_name.toLowerCase()}_${c.customer_name.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return uniqueCompanies;

    return uniqueCompanies.filter((c) =>
      `${c.company_name} ${c.customer_name} ${c.contact_no} ${c.customer_dc_no}`
        .toLowerCase()
        .includes(q)
    );
  }, [uniqueCompanies, query]);

  const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);

  const currentRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredCompanies.slice(start, start + rowsPerPage);
  }, [currentPage, filteredCompanies]);


  /* -------------------- ADD COMPANY -------------------- */
  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();

    if (!formData.company_name.trim() || !formData.customer_name.trim()) {
      toast({ variant: "destructive", title: "Company name & Customer name required" });
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/api/add_company/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await resp.json();
      if (!resp.ok || !data.status) throw new Error(data.message);

      toast({ title: "Company added" });
      setOpenModal(false);

      setFormData({
        company_name: "",
        customer_name: "",
        contact_no: "",
        customer_dc_no: "",
      });

      fetchCompanies();
    } catch (err) {
      toast({ variant: "destructive", title: "Add failed", description: err.message });
    }
  };

  /* -------------------- BULK UPLOAD -------------------- */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setBulkUploadLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const parsed: Company[] = [];

        rows.forEach((row) => {
          const company_name =
            row["company_name"] ||
            row["Company Name"] ||
            row["COMPANY NAME"];

          const customer_name =
            row["customer_name"] ||
            row["Customer Name"] ||
            row["CUSTOMER NAME"];

          const contact_no =
            row["contact_no"] ||
            row["Contact No"] ||
            row["CONTACT NO"];

          const customer_dc_no =
            row["customer_dc_no"] ||
            row["Customer DC No"] ||
            row["CUSTOMER DC NO"];

          if (!company_name || !customer_name) return;

          parsed.push({
            company_name,
            customer_name,
            contact_no: contact_no || "",
            customer_dc_no: customer_dc_no || "",
          });
        });


        setPreviewCompanies(parsed);
      } finally {
        setBulkUploadLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Fake the structure so we can reuse handleFileUpload
    handleFileUpload({ target: { files: [file] } });
  };


  const handleBulkUpload = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/bulk_upload_company/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies: previewCompanies }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message);

      toast({ title: "Bulk upload successful" });
      await fetchCompanies();
      setPreviewCompanies([]);
      setUploadedFileName("");
      setOpenModal(false);
      setActiveTab("single");
    } catch (err) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    }
  };

  /* -------------------- EDIT / DELETE -------------------- */
  const openEdit = (comp: Company) => {
    setSelectedCompany(comp);
    setEditForm(comp);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSaveEdit = async () => {
    if (!selectedCompany) return;

    setActionLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/update_company/${selectedCompany.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message);

      toast({ title: "Company updated" });
      fetchCompanies();
      setEditModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (comp: Company) => {
    setDeleteLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/delete_company/${comp.id}/`, {
        method: "DELETE",
      });

      const data = await resp.json();

      if (!resp.ok || (data && data.status === false)) {
        const msg = data?.message || "Delete failed";
        throw new Error(msg);
      }
      // remove from UI immediately (optimistic)
      setCompanies((prev) => prev.filter((c) => c.id !== comp.id));

      toast({ title: "Company deleted" });
    } catch (err) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
      throw err;
    } finally {
      setDeleteLoading(false);
    }
  };

  // Called from the Confirm dialog - ensures single-shot confirm behavior
  const confirmDelete = async () => {
    if (!companyToDelete) return;

    // prevent double clicks / duplicate calls
    if (deleteLoading) return;

    try {
      await handleDelete(companyToDelete);
      setConfirmDeleteOpen(false);
      setCompanyToDelete(null);
      // ensure list is in sync
      fetchCompanies();
    } catch {
      // keep modal open? we close and allow user to retry; either is acceptable:
      setConfirmDeleteOpen(false);
      setCompanyToDelete(null);
    }
  };

  // Exposed deletion via row button: sets state and opens confirm dialog
  const requestDelete = (comp: Company) => {
    setCompanyToDelete(comp);
    setConfirmDeleteOpen(true);
  };


  /* -------------------- UI -------------------- */
  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Companies</h2>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Search companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-60"
          />

          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 text-white">
                <Plus className="w-4 h-4" /> Add / Bulk
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl min-h-[480px]">
              <DialogHeader>
                <DialogTitle>Add Company</DialogTitle>
              </DialogHeader>

              {/* ---------------- CUSTOM BLUE TAB SWITCH INSIDE MODAL ---------------- */}
              <div className="w-full mt-2 mb-4">
                <div className="relative flex bg-blue-50 p-1 rounded-xl shadow-inner w-full">

                  {/* Moving indicator */}
                  <div
                    className={`absolute top-1 bottom-1 rounded-lg bg-blue-600 transition-all duration-300 shadow-md
            ${activeTab === "single" ? "left-1 right-[50%]" : "left-[50%] right-1"}`}
                  ></div>

                  {/* Single Entry Tab */}
                  <button
                    onClick={() => setActiveTab("single")}
                    className={`flex-1 z-10 py-2 font-semibold rounded-lg transition-all duration-300
            ${activeTab === "single" ? "text-white" : "text-blue-700 hover:text-blue-900"}`}
                  >
                    Single Entry
                  </button>

                  {/* Bulk Upload Tab */}
                  <button
                    onClick={() => setActiveTab("bulk")}
                    className={`flex-1 z-10 py-2 font-semibold rounded-lg transition-all duration-300
            ${activeTab === "bulk" ? "text-white" : "text-blue-700 hover:text-blue-900"}`}
                  >
                    Bulk Upload
                  </button>
                </div>
              </div>

              {/* ---------------- CONTENT AREA (same modal size for both tabs) ---------------- */}
              <div className="min-h-[320px]">

                {/* ---------------- SINGLE ENTRY FORM ---------------- */}
                {activeTab === "single" && (
                  <form onSubmit={handleAddCompany} className="space-y-4 animate-fadeIn">

                    <div>
                      <Label>Company Name *</Label>
                      <Input
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        pattern="^[A-Za-z0-9 _\-]{2,40}$"
                        required
                      />
                    </div>

                    <div>
                      <Label>Customer Name *</Label>
                      <Input
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        pattern="^[A-Za-z0-9 _-]{2,40}$"
                        required
                      />
                    </div>

                    <div>
                      <Label>Contact No (10 digits)</Label>
                      <Input
                        name="contact_no"
                        value={formData.contact_no}
                        onChange={handleChange}
                        pattern="^[0-9]{10}$"
                        maxLength={10}
                      />
                    </div>

                    <div>
                      <Label>Customer DC No</Label>
                      <Input
                        name="customer_dc_no"
                        value={formData.customer_dc_no}
                        onChange={handleChange}
                        pattern="^[A-Za-z0-9 _-]{1,30}$"
                      />
                    </div>

                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                      Save Company
                    </Button>
                  </form>
                )}

                {/* ---------------- BULK UPLOAD TAB ---------------- */}
                {activeTab === "bulk" && (
                  <div className="animate-fadeIn space-y-4">

                    {/* File upload area */}
                    <div className="flex justify-center items-center mt-20 border border-dashed p-5 text-center rounded-lg"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                    >
                      {!uploadedFileName ? (
                        <Label htmlFor="bulk" className="cursor-pointer">
                          <Upload className="mx-auto h-10 w-10 text-blue-500" />
                          <p className="mt-1 font-semibold text-blue-700">Upload Excel File</p>
                          <Input
                            id="bulk"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </Label>
                      ) : (
                        <div className="space-y-2">
                          <FileText className="mx-auto h-10 w-10 text-green-600" />
                          <p className="font-medium">{uploadedFileName}</p>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setUploadedFileName("");
                              setPreviewCompanies([]);
                            }}
                            className="hover:bg-blue-700 hover:text-white"
                          >
                            <X className="w-4 h-4" /> Change File
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Preview Table */}
                    {previewCompanies.length > 0 && (
                      <>
                        <p className="font-semibold">Preview ({previewCompanies.length})</p>

                        <div className="max-h-40 overflow-y-auto border rounded">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="p-2">s.no.</th>
                                <th className="p-2">Company Name</th>
                                <th className="p-2">Customer Name</th>
                              </tr>
                            </thead>
                            <tbody>
                              {previewCompanies.map((c, i) => (
                                <tr key={i} className="border-b">
                                  <td className="p-2">{i + 1}</td>
                                  <td className="p-2">{c.company_name}</td>
                                  <td className="p-2">{c.customer_name}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white w-full"
                          onClick={handleBulkUpload}
                        >
                          Upload All
                        </Button>
                      </>
                    )}
                  </div>
                )}

              </div>
            </DialogContent>
          </Dialog>


        </div>
      </div>

      {/* ---------------- TABLE ---------------- */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin mr-2" /> Loading...
        </div>
      ) : filteredCompanies.length === 0 ? (
        <p className="text-center py-10 text-gray-500 italic">
          {query ? "No matched companies found." : "No companies found."}
        </p>
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="p-2 border">S.No</th>
                  <th className="p-2 border">Company Name</th>
                  <th className="p-2 border">Customer Name</th>
                  <th className="p-2 border">Contact No.</th>
                  <th className="p-2 border">Customer DC No.</th>
                  <th className="p-2 border w-[10%]">Action</th>
                </tr>
              </thead>

              <tbody>
                {currentRows.map((c, i) => (
                  <tr key={c.id} className="text-center border-b">
                    <td className="p-2 border">{(currentPage - 1) * rowsPerPage + i + 1}</td>
                    <td className="p-2 border">{c.company_name}</td>
                    <td className="p-2 border">{c.customer_name}</td>
                    <td className="p-2 border">{c.contact_no || "-"}</td>
                    <td className="p-2 border">{c.customer_dc_no || "-"}</td>

                    <td className="p-2 border">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(c)}
                          className="flex items-center gap-1 hover:bg-transparent hover:text-black hover:scale-110"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => requestDelete(c)}
                          className="flex items-center gap-1 hover:scale-110"
                          disabled={deleteLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

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


      {/* EDIT MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md rounded-xl border shadow-lg animate-fadeIn">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-blue-700">
              Edit Company
            </DialogTitle>
          </DialogHeader>

          {selectedCompany && (
            <div className="space-y-4 mt-4">

              {/* Company Name */}
              <div>
                <Label className="font-semibold text-gray-700">Company Name *</Label>
                <Input
                  name="company_name"
                  value={editForm.company_name || ""}
                  onChange={handleEditChange}
                  pattern="^[A-Za-z0-9 _\-]{2,40}$"
                  title="Only letters, numbers, spaces, hyphens allowed. 2–40 characters."
                  className="mt-1"
                />
              </div>

              {/* Customer Name */}
              <div>
                <Label className="font-semibold text-gray-700">Customer Name *</Label>
                <Input
                  name="customer_name"
                  value={editForm.customer_name || ""}
                  onChange={handleEditChange}
                  pattern="^[A-Za-z0-9 _\-]{2,40}$"
                  title="Only letters, numbers, spaces, hyphens allowed. 2–40 characters."
                  className="mt-1"
                />
              </div>

              {/* Contact No */}
              <div>
                <Label className="font-semibold text-gray-700">Contact No (10 digits)</Label>
                <Input
                  name="contact_no"
                  value={editForm.contact_no || ""}
                  onChange={handleEditChange}
                  pattern="^[0-9]{10}$"
                  maxLength={10}
                  title="Enter a valid 10-digit number"
                  className="mt-1"
                />
              </div>

              {/* Customer DC No */}
              <div>
                <Label className="font-semibold text-gray-700">Customer DC No</Label>
                <Input
                  name="customer_dc_no"
                  value={editForm.customer_dc_no || ""}
                  onChange={handleEditChange}
                  pattern="^[A-Za-z0-9 _\-]{1,30}$"

                  title="Only letters, numbers, spaces, hyphens allowed."
                  className="mt-1"
                />
              </div>

            </div>
          )}

          <DialogFooter className="mt-6 flex justify-between">

            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              className="px-6 hover:bg-gray-200 hover:text-black "
            >
              Cancel
            </Button>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              onClick={handleSaveEdit}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Save Changes"
              )}
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete MODAL */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600 font-semibold">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-700 mt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{companyToDelete?.company_name}</span>?
            <br />
            This action cannot be undone.
          </p>

          <DialogFooter className="mt-4 flex justify-end gap-3">

            <Button
              variant="outline"
              onClick={() =>
                setConfirmDeleteOpen(false)}
              disabled={deleteLoading}
              className="hover:bg-gray-200 hover:text-black "
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={confirmDelete} disabled={deleteLoading}
            >
              {deleteLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Delete"}
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default AdminCompanies;
