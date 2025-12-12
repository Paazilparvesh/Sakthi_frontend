import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";

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

interface QaResponseType {
  material_details: number;
  processed_date: string;
  shift: string;
  no_of_sheets: string;
  cycletime_per_sheet: string;
  total_cycle_time: string;
  machines_used: MachineRow[];
}

const QaEditForm: React.FC<Props> = ({
  productId,
  materials,
  selectedMaterialId,
  setSelectedMaterialId,
}) => {
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const [qaData, setQaData] = useState<Omit<QaResponseType, "material_details">>({
    processed_date: "",
    shift: "",
    no_of_sheets: "",
    cycletime_per_sheet: "",
    total_cycle_time: "",
    machines_used: [],
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

  // MODALS
  const [machineModal, setMachineModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<"success" | "failed" | "idle">("idle");

  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------------------
   * FETCH QA DETAILS FROM BACKEND WHEN MATERIAL IS SELECTED
   * ------------------------------------------------------------------- */
  useEffect(() => {
    if (!selectedMaterialId) return;

    const fetchQA = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/get_qa_details/?product_id=${productId}`
        );

        const data: QaResponseType[] = await res.json();

        // Filter for the specific material
        const materialQA = data.find(
          (item) => item.material_details === selectedMaterialId
        );

        if (materialQA) {
          setQaData({
            processed_date: materialQA.processed_date ?? "",
            shift: materialQA.shift ?? "",
            no_of_sheets: materialQA.no_of_sheets ?? "",
            cycletime_per_sheet: materialQA.cycletime_per_sheet ?? "",
            total_cycle_time: materialQA.total_cycle_time ?? "",
            machines_used: materialQA.machines_used ?? [],
          });
        } else {
          // Reset if no QA data exists yet
          setQaData({
            processed_date: "",
            shift: "",
            no_of_sheets: "",
            cycletime_per_sheet: "",
            total_cycle_time: "",
            machines_used: [],
          });
        }
      } catch (err) {
        console.error("QA fetch error:", err);
      }
    };

    fetchQA();
  }, [selectedMaterialId, productId]);


  /* ---------------- BASIC FIELD UPDATE ---------------- */
  const updateQAField = (key: string, value: any) => {
    setQaData((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------------- MACHINE ADD ---------------- */
  const addMachine = () => {
    setQaData((prev) => ({
      ...prev,
      machines_used: [...prev.machines_used, machineForm],
    }));
    setMachineModal(false);
    resetMachineForm();
  };

  /* ---------------- MACHINE EDIT ---------------- */
  const saveMachineEdit = () => {
    if (editIndex === null) return;

    const updated = [...qaData.machines_used];
    updated[editIndex] = machineForm;

    setQaData((prev) => ({ ...prev, machines_used: updated }));
    setMachineModal(false);
    setEditIndex(null);
    resetMachineForm();
  };

  const resetMachineForm = () => {
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

  /* ---------------- MACHINE DELETE ---------------- */
  const deleteMachine = (i: number) => {
    const updated = qaData.machines_used.filter((_, idx) => idx !== i);
    setQaData((prev) => ({ ...prev, machines_used: updated }));
  };

  /* ---------------- UPDATE QA API ---------------- */
  const updateQA = async () => {
    if (!selectedMaterialId) return;

    setLoading(true);

    const payload = {
      material_details: selectedMaterialId,
      ...qaData,
    };

    console.log("📤 QA UPDATE PAYLOAD:", payload);

    try {
      const res = await fetch(`${API_URL}/api/update_qa_details/${productId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setUpdateStatus("success");
      } else {
        setUpdateStatus("failed");
      }
    } catch (err) {
      console.error("QA UPDATE FAILED:", err);
      setUpdateStatus("failed");
    }

    setLoading(false);
    setResultModal(true);
  };


  return (
    <div className="space-y-6">
      {/* MATERIAL SELECTOR */}
      <h3 className="text-lg font-semibold">Select Material for QA</h3>

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
                  className={`${
                    selectedMaterialId === m.id
                      ? "bg-green-600"
                      : "bg-blue-600"
                  }`}
                  onClick={() => setSelectedMaterialId(m.id)}
                >
                  {selectedMaterialId === m.id ? "Selected" : "Edit QA"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* QA FORM */}
      {selectedMaterial && (
        <div className="mt-6 p-5 rounded-xl border bg-gray-50 space-y-6">
          <h3 className="text-xl font-semibold">
            QA Details — {selectedMaterial.mat_type}
          </h3>

          {/* BASIC FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[ 
              ["processed_date", "Processed Date"],
              ["shift", "Shift"],
              ["no_of_sheets", "No. of Sheets"],
              ["cycletime_per_sheet", "Cycle Time / Sheet"],
              ["total_cycle_time", "Total Cycle Time"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-sm text-gray-600">{label}</label>
                <Input
                  value={(qaData as any)[key]}
                  onChange={(e) => updateQAField(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* MACHINES TABLE */}
          <h4 className="text-lg font-semibold">Machines Used</h4>

          <table className="w-full border text-center">
            <thead className="bg-gray-200">
              <tr>
                {[
                  "Machine",
                  "Date",
                  "Start",
                  "End",
                  "Runtime",
                  "Operator",
                  "Air",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="border px-2 py-1">{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {qaData.machines_used.map((m, i) => (
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
                        setEditIndex(i);
                        setMachineForm(m);
                        setMachineModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600"
                      onClick={() => deleteMachine(i)}
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
            className="bg-blue-600"
            onClick={() => {
              setEditIndex(null);
              resetMachineForm();
              setMachineModal(true);
            }}
          >
            Add Machine
          </Button>

          {/* UPDATE BUTTON (OPEN CONFIRM MODAL) */}
          <Button
            className="bg-green-600 mt-6"
            onClick={() => setConfirmModal(true)}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update QA"}
          </Button>
        </div>
      )}

      {/* ---------------- CONFIRM UPDATE ---------------- */}
      <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to update QA details?</p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600"
              onClick={() => {
                setConfirmModal(false);
                updateQA();
              }}
            >
              Yes, Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- RESULT MODAL ---------------- */}
      <Dialog open={resultModal} onOpenChange={setResultModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {updateStatus === "success" ? "QA Updated ✔" : "Update Failed ❌"}
            </DialogTitle>
          </DialogHeader>

          {updateStatus === "success" ? (
            <p className="text-green-600">QA details updated successfully.</p>
          ) : (
            <p className="text-red-600">
              Update failed. Please try again or contact support.
            </p>
          )}

          <DialogFooter>
            <Button onClick={() => setResultModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- ADD/EDIT MACHINE MODAL ---------------- */}
      <Dialog open={machineModal} onOpenChange={setMachineModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? "Edit Machine" : "Add Machine"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            {Object.keys(machineForm).map((key) => (
              <div key={key}>
                <label className="text-sm capitalize">{key}</label>
                <Input
                  value={(machineForm as any)[key]}
                  onChange={(e) =>
                    setMachineForm((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMachineModal(false)}>
              Cancel
            </Button>

            <Button
              className="bg-blue-600"
              onClick={editIndex !== null ? saveMachineEdit : addMachine}
            >
              {editIndex !== null ? "Save Changes" : "Add Machine"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QaEditForm;
