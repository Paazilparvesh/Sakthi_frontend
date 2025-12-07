import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Material } from "@/types/inward.type";

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
    total_cycle_time: "",
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

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);

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

  /* ---------------- DELETE MACHINE ---------------- */
  const handleDelete = (i: number) => {
    const updated = qaData.machines_used.filter((_, idx) => idx !== i);
    setQaData((prev: any) => ({ ...prev, machines_used: updated }));
  };

  /* ---------------- API UPDATE ---------------- */
  const handleUpdateQA = async () => {
    if (!selectedMaterialId) return;

    setLoading(true);
    setStatus("idle");

    const res = await fetch(`${API_URL}/api/update_qa_details/${productId}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        material_details: selectedMaterialId,
        ...qaData,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setStatus("success");
    } else {
      setStatus("failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* MATERIAL SELECT TABLE */}
      <h3 className="text-lg font-semibold">Select Material for QA Update</h3>

      <table className="w-full border text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">S.No</th>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">Grade</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m, i) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{i + 1}</td>
              <td className="border px-2 py-1">{m.mat_type}</td>
              <td className="border px-2 py-1">{m.mat_grade}</td>
              <td className="border px-2 py-1">
                <Button
                  size="sm"
                  onClick={() => setSelectedMaterialId(m.id)}
                  className="bg-blue-600"
                >
                  Edit QA
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* QA FORM */}
      {selectedMaterial && (
        <div className="mt-6 p-4 border rounded-xl bg-gray-50 space-y-4">
          <h3 className="text-xl font-semibold mb-4">
            Edit QA Details for {selectedMaterial.mat_type}
          </h3>

          {/* BASIC QA FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  value={qaData[key] || ""}
                  onChange={(e) => updateQAField(key, e.target.value)}
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
                    <Button
                      size="sm"
                      className="bg-yellow-600"
                      onClick={() => {
                        setMachineForm(m);
                        setEditIndex(i);
                        setOpenModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600"
                      onClick={() => handleDelete(i)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ADD MACHINE BUTTON */}
          <Button
            className="mt-3 bg-blue-600"
            onClick={() => {
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
              setOpenModal(true);
            }}
          >
            Add Machine
          </Button>

          {/* UPDATE QA BUTTON */}
          <Button
            className="mt-6 bg-green-600"
            onClick={handleUpdateQA}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update QA"}
          </Button>

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
              {editIndex !== null ? "Edit Machine" : "Add Machine"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(machineForm).map((key) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm text-gray-600 capitalize">
                    {key.replace(/_/g, " ")}
                  </label>
                  <Input
                    value={(machineForm as any)[key]}
                    onChange={(e) =>
                      setMachineForm((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
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
    </div>
  );
};

export default QaEditForm;
