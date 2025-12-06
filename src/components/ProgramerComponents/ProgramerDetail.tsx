import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgramerDetailProps, QAData } from "@/types/qa.type";
import { Material } from "@/types/inward.type";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";

const renderFieldCard = (
  label: string,
  value: string | number,
  isStatus?: boolean
) => {
  const statusColor =
    typeof value === "string" && isStatus
      ? value.toLowerCase() === "pending"
        ? "w-24 rounded-full px-3 text-yellow-600 bg-yellow-100 border-yellow-300"
        : "w-28 rounded-full px-3 text-green-600 bg-green-100 border-green-300"
      : "text-gray-800";

  const displayValue = value !== null && value !== undefined ? value : "-";

  return (
    <Card
      className={`shadow-sm rounded-lg border ${isStatus ? "border-transparent" : "border-gray-200"
        }`}
    >
      <CardContent className="p-4">
        <span className="text-gray-500 font-medium text-sm">{label}</span>
        <p
          className={`font-semibold text-base md:text-lg mt-1 block py-1 ${statusColor}`}
        >
          {displayValue || "-"}
        </p>
      </CardContent>
    </Card>
  );
};

const ProgramerDetail: React.FC<ProgramerDetailProps> = ({ item }) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [materialDataMap, setMaterialDataMap] = useState<Record<number, QAData>>({});
  const [loadingID, setLoadingID] = useState<number | null>(null);
  const { toast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL;
  const materials: Material[] = item.materials || [];

  /** 🔍 Fetch programmer data for specific material */
  const handleViewProgram = async (materialId: number) => {
    if (selectedMaterialId === materialId) {
      setSelectedMaterialId(null);
      return;
    }

    // Already cached
    if (materialDataMap[materialId]) {
      setSelectedMaterialId(materialId);
      return;
    }

    try {
      setLoadingID(materialId);

      // 🧠 Smart filtering via backend query params
      const url = `${API_URL}/api/get_programer_Details/?product_id=${item.id}&material_id=${materialId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch data");

      if (Array.isArray(data) && data.length > 0) {
        const matched = data[0]; // Backend already filtered, so take first result
        setMaterialDataMap((prev) => ({ ...prev, [materialId]: matched }));
        setSelectedMaterialId(materialId);
      } else {
        toast({
          title: "No record found",
          description: `No programmer data linked for material ID: ${materialId}.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching programmer details:", error);
      toast({
        title: "Error",
        description: error.message || "Unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoadingID(null);
    }
  };


  return (
    <Card className="p-4 sm:p-6 md:p-8 mx-auto w-full">

      {/* Inward Details */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">
          Inward Details
        </h3>
        <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-sm">
          <table className="w-full border-collapse text-center text-sm sm:text-base rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="border px-1 py-1">Serial No.</th>
                <th className="border px-1 py-1">Date</th>
                <th className="border px-1 py-1">Inward Slip No.</th>
                <th className="border px-1 py-1">WO. No.</th>
                <th className="border px-1 py-1">Company Name</th>
                <th className="border px-1 py-1">Customer Name</th>
                <th className="border px-1 py-1">Contact No.</th>
                <th className="border px-1 py-1">Customer Dc No.</th>
                <th className="border px-1 py-1">Color</th>
                <th className="border px-1 py-1">Created By</th>
              </tr>
            </thead>
            <tbody>
              <>
                <tr className="hover:bg-gray-50 transition-colors text-gray-800">
                  <td className="border px-2 py-2 font-medium">
                    {item.serial_number}
                  </td>
                  <td className="border px-2 py-2">{item.date}</td>
                  <td className="border px-2 py-2">
                    {item.inward_slip_number}
                  </td>
                  <td className="border px-2 py-2">{item.worker_no || "—"}</td>
                  <td className="border px-2 py-2">{item.company_name}</td>
                  <td className="border px-2 py-2">{item.customer_name}</td>
                  <td className="border px-2 py-2">{item.contact_no}</td>
                  <td className="border px-2 py-2">{item.customer_dc_no}</td>
                  <td className="border px-2 py-2">
                    {item.color}
                  </td>
                  <td className="border px-2 py-2">{item.created_by}</td>
                </tr>
              </>
            </tbody>
          </table>
        </div>
      </section>

      {/* Product Materials */}
      {materials.length > 0 && (
        <section className="mt-10 space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Product Materials
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-sm">
            <table className="w-full border-collapse text-center text-sm sm:text-base rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="border px-1 py-1">S.No</th>
		  <th className="border px-1 py-1">Bay</th>
                  <th className="border px-1 py-1">Material Type</th>
                  <th className="border px-1 py-1">Material Grade</th>
                  <th className="border px-1 py-1">Thick (mm)</th>
                  <th className="border px-1 py-1">Width (mm)</th>
                  <th className="border px-1 py-1">Length (mm)</th>
                  <th className="border px-1 py-1">Density</th>
                  <th className="border px-1 py-1">Unit Weight (kg)</th>
                  <th className="border px-1 py-1">Quantity</th>
                  <th className="border px-1 py-1">Total Weight (kg)</th>
                  <th className="border px-1 py-1">Stock Due (Days)</th>
                  <th className="border px-1 py-1">Remarks</th>
                  {materials[0].programer_status === "completed" && (
                    <th className="border px-2 py-2">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {materials.map((mat, index) => (
                  <React.Fragment key={mat.id || index}>
                    <tr className="hover:bg-gray-50 transition-colors text-gray-800">
                      <td className="border px-2 py-2 font-medium">
                        {index + 1}
                      </td>
		      <td className="border px-2 py-2">{mat.bay || "-"}</td>
                      <td className="border px-2 py-2">{mat.mat_type || "-"}</td>
                      <td className="border px-2 py-2">{mat.mat_grade || "-"}</td>
                      <td className="border px-2 py-2">{mat.thick ?? "-"}</td>
                      <td className="border px-2 py-2">{mat.width ?? "-"}</td>
                      <td className="border px-2 py-2">{mat.length ?? "-"}</td>
                      <td className="border px-2 py-2">{mat.density ?? "-"}</td>
                      <td className="border px-2 py-2">
                        {/* {mat.unit_weight ?? "-"} */}
                        {Number(mat.unit_weight).toFixed(2)}
                      </td>
                      <td className="border px-2 py-2">{mat.quantity ?? "-"}</td>
                      <td className="border px-2 py-2">
                        {/* {mat.total_weight ?? "-"} */}
                        {Number(mat.total_weight).toFixed(2)}
                      </td>
                      <td className="border px-2 py-2">{mat.stock_due ?? "-"}</td>
                      <td className="border px-2 py-2">{mat.remarks || "—"}</td>
                      {mat.programer_status === "completed" && (
                        <td className="border px-2 py-2">
                          <Button
                            onClick={() => handleViewProgram(mat.id!)}
                            disabled={loadingID === mat.id}
                            className="bg-blue-700 hover:bg-blue-600"
                          >
                            {loadingID === mat.id
                              ? "Loading..."
                              : selectedMaterialId === mat.id
                                ? "Hide"
                                : "View"}
                          </Button>
                        </td>
                      )}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Programmer Details */}
      {materials[0].programer_status === "completed" && (
        <section className="mt-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Programmer Details
          </h3>

          {selectedMaterialId && materialDataMap[selectedMaterialId] ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(materialDataMap[selectedMaterialId]).map(
                ([key, value]) => {
                  if (
                    ["id", "product_details", "material_details"].includes(key)
                  )
                    return null;
                  return (
                    <React.Fragment key={key}>
                      {renderFieldCard(
                        key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                        value
                      )}
                    </React.Fragment>
                  );
                }
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-8">
              {loadingID
                ? "Fetching programmer details..."
                : "Click a row’s 'View' button to see programmer details."}
            </p>
          )}
        </section>
      )}
    </Card>
  );
};

export default ProgramerDetail;
