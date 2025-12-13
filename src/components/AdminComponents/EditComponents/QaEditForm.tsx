import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Material } from "@/types/inward.type";
import { useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";


const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  productId: number;
  materials: Material[];
  selectedMaterialId: number | null;
  setSelectedMaterialId: (id: number | null) => void;
}

interface MachineRow {
  machine: string;
  date: string;
  start: string;
  end: string;
  runtime: string;
  operator: string;
  air: string;
}

const QaEditForm: React.FC<Props> = ({
  productId,
  materials,
  selectedMaterialId,
  setSelectedMaterialId,
}) => {
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const [qaData, setQaData] = useState<any>({
    processed_date: "",
    shift: "",
    no_of_sheets: "",
    cycletime_per_sheet: "",
    // total_cycle_time: "",
    machines_used: [] as MachineRow[],
  });

  const [machineForm, setMachineForm] = useState<MachineRow>({
    machine: "",
    date: "",
    start: "",
    end: "",
    runtime: "",
    operator: "",
    air: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [operators, setOperators] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);



  const [loading, setLoading] = useState(false);
  const [status, setStatus] =
    useState<"idle" | "success" | "failed">("idle");

  const updateQAField = (key: string, value: any) => {
    setQaData((prev: any) => ({ ...prev, [key]: value }));
  };

  /* ---------------- ADD MACHINE ---------------- */
  const handleAddMachine = () => {
    setQaData((prev: any) => ({
      ...prev,
      machines_used: [...prev.machines_used, machineForm],
    }));

    setMachineForm({
      machine: "",
      date: "",
      start: "",
      end: "",
      runtime: "",
      operator: "",
      air: "",
    });

    setOpenModal(false);
  };

  /* ---------------- EDIT MACHINE ---------------- */
  const handleSaveEditMachine = () => {
    if (editIndex === null) return;

    const updated = [...qaData.machines_used];
    updated[editIndex] = machineForm;

    setQaData((prev: any) => ({ ...prev, machines_used: updated }));

    setOpenModal(false);
    setEditIndex(null);
    setMachineForm({
      machine: "",
      date: "",
      start: "",
      end: "",
      runtime: "",
      operator: "",
      air: "",
    });
  };


  const handleUpdateQA = async () => {
    if (!selectedMaterialId) return;

    setLoading(true);
    setStatus("idle");

    const sheets = Number(qaData.no_of_sheets);
    const cycle = Number(qaData.cycletime_per_sheet);
    const total = sheets > 0 && cycle > 0 ? sheets * cycle : null;

    const payload = {
      material_details: selectedMaterialId,
      processed_date: qaData.processed_date || null,
      shift: qaData.shift || null,

      no_of_sheets: sheets,
      cycletime_per_sheet: cycle,
      total_cycle_time: total,   // 🟢 FIXED

      machines_used: qaData.machines_used ?? [],
    };

    console.log("📤 QA UPDATE PAYLOAD:", payload);

    const res = await fetch(`${API_URL}/api/update_qa_details/${productId}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.ok) {
      setStatus("success");
    } else {
      setStatus("failed");
    }
  };

  useEffect(() => {
    console.log("🟡 QA Effect Fired");
    console.log("Incoming productId:", productId);
    console.log("Incoming selectedMaterialId:", selectedMaterialId);

    const pId = Number(productId);
    const mId = Number(selectedMaterialId);

    if (!pId || isNaN(pId) || !mId || isNaN(mId)) {
      console.log("⛔ Not fetching QA yet:", pId, mId);
      return;
    }

    const url = `${API_URL}/api/get_qa_details/?product_id=${pId}`;
    console.log("🌍 Fetching QA:", url);

    const fetchQA = async () => {
      try {
        const res = await fetch(url);
        console.log("QA STATUS:", res.status);

        if (!res.ok) {
          console.log("⚠ QA not found or 404");
          return;
        }

        const data = await res.json();
        console.log("🎯 QA DATA:", data);

        // Filter by material (because backend not filtering yet)
        const match = data.find((item: any) => item.material_id === mId);

        if (!match) {
          console.log("❌ QA not found for material");
          return;
        }

        console.log("✔ Matched QA:", match);

        setQaData({
          id: match.id,
          processed_date: match.processed_date ?? "",
          shift: match.shift ?? "",
          no_of_sheets: match.no_of_sheets ?? "",
          cycletime_per_sheet: match.cycletime_per_sheet ?? "",
          total_cycle_time: match.total_cycle_time ?? "",
          machines_used: match.machines_used ?? [],
        });

      } catch (error) {
        console.error("❌ QA Fetch Error:", error);
      }
    };

    fetchQA();
  }, [productId, selectedMaterialId]);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await fetch(`${API_URL}/api/get_operator/`);
        if (!res.ok) return;

        const data = await res.json();
        console.log("Operators:", data);

        const parsed = data.map((op: any) => ({
          id: op.id,
          name: op.operator_name,
        }));

        setOperators(parsed);
      } catch (err) {
        console.error("Operator fetch error:", err);
      }
    };

    fetchOperators();
  }, []);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await fetch(`${API_URL}/api/get_machines/`);
        if (!res.ok) return;

        const data = await res.json();
        console.log("Machines:", data);

        const parsed = data.map((mc: any) => ({
          id: mc.id,
          name: mc.machine_name,
        }));

        setMachines(parsed);
      } catch (err) {
        console.error("Machine fetch error:", err);
      }
    };

    fetchMachines();
  }, []);



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Select Material for QA Update</h3>
        {selectedMaterial && (
          <Button
            className=" bg-green-600"
            onClick={() => setShowConfirm(true)}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update QA"}
          </Button>
        )}
      </div>
      {/* MATERIAL DROPDOWN */}
      <div className="flex flex-col space-y-1.5 w-full md:w-1/3">
        <select
          value={selectedMaterialId ?? ""}
          onChange={(e) => setSelectedMaterialId(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 focus:ring-2 border-gray-300 focus:ring-blue-500"
        >
          <option value="">Select Material</option>

          {materials.map((mat) => (
            <option key={mat.id} value={mat.id}>
              MT-{mat.mat_type} / G-{mat.mat_grade} / T-{mat.thick} / W-{mat.width} / L-{mat.length} / Qty-{mat.quantity}
            </option>
          ))}
        </select>
      </div>



      {selectedMaterial && (
        <div
          key={selectedMaterialId}
          className="mt-6 p-4 border rounded-xl bg-gray-50 space-y-4"
        >

          {/* BASIC QA FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              ["processed_date", "Processed Date"],
              ["shift", "Shift"],
              ["no_of_sheets", "No. of Sheets"],
              ["cycletime_per_sheet", "Cycle Time / Sheet"],
              ["total_cycle_time", "Total Cycle Time"],
            ].map(([key, label]) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm text-gray-600">{label}</label>



                <Input
                  type={
                    key === "processed_date"
                      ? "date"
                      : key === "shift"
                        ? "text"
                        : "number"
                  }
                  min={key !== "processed_date" && key !== "shift" ? 0 : undefined}
                  value={
                    key === "total_cycle_time"
                      ? (Number(qaData.no_of_sheets) * Number(qaData.cycletime_per_sheet) || 0)
                      : qaData[key] || ""
                  }
                  readOnly={key === "total_cycle_time"}
                  onChange={(e) =>
                    updateQAField(
                      key,
                      key === "processed_date" || key === "shift"
                        ? e.target.value
                        : Number(e.target.value)
                    )
                  }
                />

              </div>
            ))}
          </div>

          {/* MACHINE TABLE */}
          <h4 className="text-lg font-semibold mt-6">Machines Used</h4>

          <table className="w-full border text-center mt-3">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2 py-1">Machine</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Start</th>
                <th className="border px-2 py-1">End</th>
                <th className="border px-2 py-1">Runtime</th>
                <th className="border px-2 py-1">Operator</th>
                <th className="border px-2 py-1">Air</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {qaData.machines_used.map((m: MachineRow, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{m.machine}</td>
                  <td className="border px-2 py-1">{m.date}</td>
                  <td className="border px-2 py-1">{m.start}</td>
                  <td className="border px-2 py-1">{m.end}</td>
                  <td className="border px-2 py-1">{m.runtime}</td>
                  <td className="border px-2 py-1">{m.operator}</td>
                  <td className="border px-2 py-1">{m.air}</td>
                  <td className="border px-2 py-1 flex gap-2 justify-center">
                    <button
                      className="p-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white"
                      onClick={() => {
                        setMachineForm(m);
                        setEditIndex(i);
                        setOpenModal(true);
                      }}
                    >
                      <Edit size={16} />
                    </button>


                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {status === "success" && (
            <p className="text-green-600 mt-3 font-medium">
              QA updated successfully ✔
            </p>
          )}

          {status === "failed" && (
            <p className="text-red-600 mt-3 font-medium">
              Failed to update QA ❌
            </p>
          )}
        </div>
      )}


      {/* ---------------- MODAL FOR MACHINE ADD/EDIT ---------------- */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              {editIndex !== null && "Edit Machine"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(machineForm).map((key) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm text-gray-600 capitalize">
                    {key.replace(/_/g, " ")}
                  </label>

                  {key === "machine" ? (
                    <select
                      className="border rounded-md px-3 py-2"
                      value={machineForm.machine}
                      onChange={(e) =>
                        setMachineForm((prev) => ({ ...prev, machine: e.target.value }))
                      }
                    >
                      <option value="">Select Machine</option>

                      {machines.map((mc) => (
                        <option key={mc.id} value={mc.name}>
                          {mc.name}
                        </option>
                      ))}
                    </select>
                  ) : key === "operator" ? (
                    <select
                      className="border rounded-md px-3 py-2"
                      value={machineForm.operator}
                      onChange={(e) =>
                        setMachineForm((prev) => ({ ...prev, operator: e.target.value }))
                      }
                    >
                      <option value="">-- Select Operator --</option>
                      {operators.map((op) => (
                        <option key={op.id} value={op.name}>
                          {op.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={
                        key === "date"
                          ? "date"
                          : key === "start" || key === "end" || key === "runtime"
                            ? "time"
                            : "text"
                      }
                      value={(machineForm as any)[key]}
                      onChange={(e) =>
                        setMachineForm((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                    />
                  )}

                </div>
              ))}


            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                className="bg-gray-300 text-black"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-blue-600 text-white"
                onClick={
                  editIndex !== null
                    ? handleSaveEditMachine
                    : handleAddMachine
                }
              >
                {editIndex !== null ? "Save Changes" : "Add Machine"}
              </Button>


            </div>
          </div>

        </div>

      )}
      {/* CONFIRM UPDATE MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center p-4 z-50">

          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl text-center animate-in slide-in-from-bottom-5">

            <h3 className="text-lg font-semibold mb-4">Confirm Update</h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to update QA details?
            </p>

            <div className="flex justify-center gap-4">

              <Button
                className="bg-gray-300 text-black hover:bg-gray-200"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  setShowConfirm(false);
                  handleUpdateQA();
                }}
              >
                Confirm
              </Button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default QaEditForm;