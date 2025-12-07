import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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

const ProgrammerEditForm: React.FC<Props> = ({
    productId,
    materials,
    selectedMaterialId,
    setSelectedMaterialId,
}) => {
    const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [resultModal, setResultModal] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<"success" | "failed" | "idle">("idle");
    const [attempts, setAttempts] = useState(0);

    const updateField = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    /* ---------------------------------------------------------
     * API: Update Programmer Details
     * --------------------------------------------------------- */
    const handleUpdate = async () => {
        if (!selectedMaterialId) return;

        setLoading(true);

        const payload = {
            material_details: selectedMaterialId,
            ...formData,
        };

        console.log("📤 PROGRAMMER UPDATE PAYLOAD:", payload);

        try {
            const res = await fetch(
                `${API_URL}/api/update_programer_details/${productId}/`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (res.ok) {
                setUpdateStatus("success");
            } else {
                setUpdateStatus("failed");
            }
        } catch (err) {
            console.error("PROGRAMMER UPDATE ERROR:", err);
            setUpdateStatus("failed");
        }

        setLoading(false);
        setResultModal(true);
    };

    /* ---------------------------------------------------------
     * Programmer Fields (based on backend)
     * --------------------------------------------------------- */
    const programmerFields = [
        "program_no",
        "program_date",
        "processed_quantity",
        "balance_quantity",
        "processed_width",
        "processed_length",
        "used_weight",
        "number_of_sheets",
        "cut_length_per_sheet",
        "pierce_per_sheet",
        "processed_mins_per_sheet",
        "total_planned_hours",
        "total_meters",
        "total_piercing",
        "total_used_weight",
        "total_no_of_sheets",
        "date",
        "time",
        "remarks",
    ];

    return (
        <div className="space-y-6">
            {/* Material Selection Table */}
            <h3 className="text-lg font-semibold">Select Material</h3>

            <table className="w-full border text-center">
                <thead className="bg-gray-100 text-gray-700">
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
                                    className={`${selectedMaterialId === m.id
                                            ? "bg-green-600"
                                            : "bg-blue-600"
                                        }`}
                                    onClick={() => setSelectedMaterialId(m.id)}
                                >
                                    {selectedMaterialId === m.id ? "Selected" : "Edit"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Programmer Edit Form */}
            {selectedMaterial && (
                <div className="mt-6 p-5 border rounded-lg bg-gray-50 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">
                        Programmer Details – {selectedMaterial.mat_type} ({selectedMaterial.mat_grade})
                    </h3>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {programmerFields.map((field) => (
                            <div key={field} className="flex flex-col">
                                <label className="text-sm text-gray-600 capitalize">
                                    {field.replace(/_/g, " ")}
                                </label>
                                <Input
                                    placeholder={field.replace(/_/g, " ")}
                                    value={formData[field] || ""}
                                    onChange={(e) => updateField(field, e.target.value)}
                                    className="bg-gray-50"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Update Button */}
                    <Button
                        className="mt-6 bg-green-600 text-white"
                        onClick={() => setConfirmModal(true)}
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update Programmer"}
                    </Button>
                </div>
            )}

            {/* ---------------------------------------------------------
        CONFIRMATION MODAL
      --------------------------------------------------------- */}
            <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Update</DialogTitle>
                    </DialogHeader>

                    <p className="text-gray-700">
                        Are you sure you want to update programmer details?
                    </p>

                    <DialogFooter className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setConfirmModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 text-white"
                            onClick={() => {
                                setConfirmModal(false);
                                handleUpdate();
                            }}
                        >
                            Yes, Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ---------------------------------------------------------
        RESULT MODAL
      --------------------------------------------------------- */}
            <Dialog open={resultModal} onOpenChange={setResultModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {updateStatus === "success"
                                ? "Update Successful"
                                : "Update Failed"}
                        </DialogTitle>
                    </DialogHeader>

                    {updateStatus === "success" ? (
                        <p className="text-green-700 font-medium">
                            ✔ Programmer details updated successfully.
                        </p>
                    ) : (
                        <p className="text-red-700 font-medium">
                            ❌ Update failed. Please try again or contact support.
                        </p>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setResultModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProgrammerEditForm;
