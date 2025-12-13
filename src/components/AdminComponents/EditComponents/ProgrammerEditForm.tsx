import React, { useState, useEffect } from "react";
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

    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [resultModal, setResultModal] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<"success" | "failed" | "idle">("idle");

    /* ---------------------------------------------
        HANDLE DROPDOWN MATERIAL CHANGE
    --------------------------------------------- */
    const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        setSelectedMaterialId(id);
        setFormData({});
    };

    useEffect(() => {
        if (materials.length === 1 && !selectedMaterialId) {
            setSelectedMaterialId(materials[0].id);  // auto-select
        }
    }, [materials, selectedMaterialId]);

    /* ---------------------------------------------
        LOAD PROGRAMMER DETAILS WHEN MATERIAL CHANGES
    --------------------------------------------- */
    useEffect(() => {
        if (!selectedMaterialId) return;

        const url = `${API_URL}/api/get_programer_Details/?product_id=${productId}&material_id=${selectedMaterialId}`;

        const fetchDetails = async () => {
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    console.error("FETCH ERROR:", await res.text());
                    return;
                }

                const data = await res.json();
                if (!Array.isArray(data) || data.length === 0) return;

                setFormData(data[0]);
            } catch (err) {
                console.error("FETCH FAILED:", err);
            }
        };

        fetchDetails();
    }, [selectedMaterialId, productId]);

    /* ---------------------------------------------
        FORM FIELD CHANGE HANDLER
    --------------------------------------------- */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* ---------------------------------------------
        UPDATE PROGRAMMER DETAILS
    --------------------------------------------- */
    const handleUpdate = async () => {
        if (!selectedMaterialId) return;

        setLoading(true);

        const payload = {
            material_details: selectedMaterialId,
            ...formData,
        };

        console.log("📤 PAYLOAD:", payload);

        try {
            const res = await fetch(
                `${API_URL}/api/update_programer_details/${productId}/`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            setUpdateStatus(res.ok ? "success" : "failed");
        } catch (err) {
            console.error("UPDATE ERROR:", err);
            setUpdateStatus("failed");
        }

        setLoading(false);
        setResultModal(true);
    };

    /* ---------------------------------------------
        PROGRAMMER FIELDS
    --------------------------------------------- */
    const fields = [
        "program_no",
        "program_date",
        "processed_quantity",
        "balance_quantity",
        "processed_width",
        "processed_length",
        "used_weight",
        "total_used_weight",
        "number_of_sheets",
        "total_no_of_sheets",
        "cut_length_per_sheet",
        "total_meters",
        "pierce_per_sheet",
        "total_piercing",
        "processed_mins_per_sheet",
        "total_planned_hours",



        "remarks",
    ];

    const label = (key: string) => key.replace(/_/g, " ").toUpperCase();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Select Material for Programmer Update</h3>
            {/*  MATERIAL DROPDOWN */}
            <div className="flex flex-col space-y-1.5 w-full md:w-1/3">
                <select
                    value={selectedMaterialId ?? ""}
                    onChange={handleMaterialChange}
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

            {/* ----------------- SHOW FIELDS ONLY AFTER MATERIAL SELECTED ----------------- */}
            {selectedMaterialId && (
                <div className="mt-4 p-5 border rounded-xl bg-gray-50 shadow-sm space-y-6">
                    <h3 className="text-xl font-semibold">
                        Programmer Details
                    </h3>

                    {/* ----------------- FORM FIELDS ----------------- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

                        {fields.map((key) => (
                            <div key={key} className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">
                                    {label(key)}
                                </label>




                                <input
                                    type={
                                        key === "remarks"
                                            ? "text"
                                            : key === "program_no"
                                                ? "text"
                                                : key === "program_date"
                                                    ? "date"
                                                    : "number"
                                    }
                                    name={key}
                                    value={formData[key] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // Remarks: full text allowed
                                        if (key === "remarks") {
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                [key]: value,
                                            }));
                                            return;
                                        }

                                        // program_no: alphanumeric allowed
                                        if (key === "program_no") {
                                            const cleanedValue = value.replace(/[^a-zA-Z0-9 -]/g, "");
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                [key]: cleanedValue,
                                            }));
                                            return;
                                        }

                                        // program_date: save directly (date input)
                                        if (key === "program_date") {
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                [key]: value,
                                            }));
                                            return;
                                        }

                                        // For other fields => numbers only
                                        const cleanedValue = value.replace(/[^0-9.]/g, "");
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            [key]: cleanedValue,
                                        }));
                                    }}
                                    className="border rounded-lg px-3 py-2 focus:ring-2 border-gray-300 focus:ring-blue-500"
                                />



                            </div>
                        ))}
                    </div>

                    {/* ----------------- UPDATE BUTTON ----------------- */}
                    <Button
                        className="mt-4 bg-green-600 text-white"
                        onClick={() => setConfirmModal(true)}
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update Programmer"}
                    </Button>
                </div>
            )}

            {/* ----------------- CONFIRM MODAL ----------------- */}
            <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Update</DialogTitle>
                    </DialogHeader>

                    <p className="text-gray-700">
                        Are you sure you want to update programmer details?
                    </p>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600"
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

            {/* ----------------- RESULT MODAL ----------------- */}
            <Dialog open={resultModal} onOpenChange={setResultModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {updateStatus === "success"
                                ? "Update Successful"
                                : "Update Failed"}
                        </DialogTitle>
                    </DialogHeader>

                    <p
                        className={`font-medium ${updateStatus === "success"
                            ? "text-green-700"
                            : "text-red-700"
                            }`}
                    >
                        {updateStatus === "success"
                            ? "✔ Programmer details updated successfully."
                            : "❌ Update failed. Please try again."}
                    </p>

                    <DialogFooter>
                        <Button onClick={() => setResultModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProgrammerEditForm;